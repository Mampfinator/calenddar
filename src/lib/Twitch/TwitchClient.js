const { default: fetch } = require("node-fetch");

module.exports = class TwitchClient {
    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    async fetchAppAccessToken() {
        return Object.remap([
            {from: ["access_token"], to: "accessToken"},
            {from: ["refresh_token"], to: "refreshToken"},
            {from: ["expires_in"], to: "expiresIn"},
            {from: ["scope"], to: "scope"},
            {from: ["token_type"], to: "tokenType"},
            {from: ["refresh_token"], to: "refreshToken"}
        ], await (
            await fetch(`https://id.twitch.tv/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`, {method: "POST"})
        ).json());
    }

    autoFetch(target, callback) {
        if (target === "accessToken") {
            async function fn(client) {
                let {accessToken, expiresIn, error} = await client.fetchAppAccessToken();
                if (error) throw error;
                callback(accessToken);
                setTimeout(fn, expiresIn-100, client)
            };

            fn(this);
        }
    }
}