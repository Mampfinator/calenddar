const { default: fetch } = require("node-fetch");
module.exports = class TwitcastingClient {
    constructor(clientId, clientSecret, redirectUri) {
        this.clientId = clientId;
        this.clientSecret = clientSecret; 
        this.redirectUri = redirectUri;
    }

    async fetchAccessToken(code) {
        let url = `https://apiv2.twitcasting.tv/oauth2/access_token?code=${code}&grant_type=authorization_code&client_id=${this.clientId}&client_secret=${this.clientSecret}&redirect_uri=${this.redirectUri}`;
        console.log(url);

        let rawResult = await (
            await fetch(url, {method: "POST", headers: {"Content-Type": "application/x-www-form-urlencoded"}})
        ).json();

        console.log(rawResult);

        return Object.remap([
            {from: ["access_token"], to: "accessToken"},
            {from: ["expires_in"], to: "expiresIn"},
            {from: ["token_type"], to: "tokenType"},
            {from: ["error"], to: "error"}
        ], rawResult);
    }

    autoFetch(target, code, callback) {
        if (target === "accessToken") {
            async function fn(client) {
                let result = await client.fetchAccessToken(code);
                let {error, accessToken, expiresIn} = result;
                if (error) {
                    console.log(
                        error.details.code,
                        error.details.grant_type,
                        error.details.client_id,
                        error.details.client_secret,
                        error.details.redirect_uri
                    );
                }
                callback(accessToken);
                setTimeout(fn, expiresIn-100, client)
            };

            fn(this);
        }
    }
}