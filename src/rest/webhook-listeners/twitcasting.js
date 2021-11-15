const {json} = require("express");

const {TwitcastingStream, TwitcastingUser} = require("../../lib/Twitcasting");
const {twitcastingStats}        = require("../../pm2");

//const fetch = require("node-fetch");
const {LIVE, RECORDING_LIVE, OFFLINE} = require("../../util/constants").events.TWITCASTING;
let {callbackPaths} = require("../../config.json");

module.exports = {
    method: "POST",
    path: callbackPaths.twitcasting,
    middlewares: [json({type: () => true})],
    callback: async (req, res, _, server) => {
        let {body} = req;

        // validate if it's actually coming from Twitcasting:
        if (!body || body.signature !== process.env.TWITCASTING_WEBHOOK_SECRET) {
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            console.error("Unauthorized Twitcasting webhook access from", ip);
            return res.status(403).send("invalidWebhookSignature");
        }

        twitcastingStats.webhookTracker.mark();
        
        let stream = TwitcastingStream.from({movie: body.movie, broadcaster: body.broadcaster}, "api");

        // check to see if the Twitcasting profile should still be tracked. If no, send a request to Twitcasting to remove the Webhook.
        let isStillRegistered = await server.db.collection("twitcasting_profiles").findOne({id: stream.channel});
        if (!isStillRegistered) {
            res.status(204).send();

            let u = new TwitcastingUser(stream.channel);
            u.removeWebhook().then(() => twitcastingRequestsPerSecond.mark());
            TwitcastingUser.__users.delete(u.id);

            return;
        }

        server.api.relay(
            {live: LIVE, recording: RECORDING_LIVE, offline: OFFLINE}[stream.status], stream.export()
        );

        res.status(204).send();
    }
}