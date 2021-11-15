const {TwitcastingClient} = require("../../lib/Twitcasting");

module.exports = {
    path: "/oauth2/twitcasting",
    method: "GET",
    callback: async (req, res, _, server) => {
        if (process.env.TWITCASTING_CODE) {
            console.log("twitcasting code already set.");
            res.send(400);
        }
        const {code} = req.query;
        console.log("Twitcasting code: ", code);
        if (!code) return res.send(400);
        res.status(204).send();

        process.env.TWITCASTING_CODE = code;
        server.twitcastingClient.autoFetch("accessToken", process.env.TWITCASTING_CODE, (accessToken) => {process.env.TWITCASTING_ACCESS_TOKEN = accessToken; console.log("Twitcasting access token: ", accessToken)});
    }
}