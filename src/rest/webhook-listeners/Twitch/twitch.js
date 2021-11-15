const {createHmac} = require("crypto");
const {json} = require("express");

let seenMessages = new Set();
const handleEvent = require("./events/eventHandler");

const {twitchStats} = require("../../../pm2");

let verify = (req, res, buff, encoding) => {
    let [algorithm, signature] = req.header("Twitch-Eventsub-Message-Signature").split("=");

    req.computedSignature = createHmac(algorithm, process.env.TWITCH_WEBHOOK_SECRET)
    .update(req.header("Twitch-Eventsub-Message-Id") + req.header("Twitch-Eventsub-Message-Timestamp") + buff)
    .digest("hex")
    
    req.authenticated = req.computedSignature == signature;
}

let {callbackPaths} = require("../../../config.json");
module.exports = {
    method: "POST",
    path: callbackPaths.twitch,
    // use the verify callback of the JSON body parser to save the raw request buffer, since we need it for signature verification.
    middlewares: [json({type: () => true, verify})],
    callback: (req, res, _, server) => {
        if (!req.header("Twitch-Eventsub-Message-Signature")) return res.status(404).send();

        if (!req.authenticated) {
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            console.log(`Got invalid Twitch signature from ${ip}: Got: ${req.header("Twitch-Eventsub-Message-Signature")}, expected: ${req.computedSignature}`)
            return res.status(403).send();
        }

        twitchStats.webhookTracker.mark();

        // handle webhook authentication
        if (req.body.challenge) {
            console.log(`Received Webhook verification challenge for: ${req.body.subscription.id} (Type: ${req.body.subscription.type}, User: ${req.body.subscription.condition.broadcaster_user_id})`);
            return res.status(200).send(req.body.challenge);
        }

        // ensure that duplicates don't get handled more than once, in case the server has a network hangup or is otherwise unable to respond to incoming webhooks
        if (seenMessages.has(req.header("Twitch-Eventsub-Message-Id"))) res.status(200).send();
        else seenMessages.add(req.header("Twitch-Eventsub-Message-Id"));   

        console.log("Received valid event. Getting event handler from \n", handleEvent.events);

        handleEvent.handle(server, req.body);

        res.status(200).send();
    }
}