const fetch = require("node-fetch");

module.exports = class YouTubeAPIBatcher{
    constructor(apiKey, requestBuilder, ...args) {
        this.key = apiKey;
        this.requestBuilder = requestBuilder;
        this.initialArgs = args;
    }

    async fetch(...args) {
        let request = this.requestBuilder(this, ...args);
        let response;
        if (request instanceof Array) {
            let items = [];
            for (let req of request) {
                req = await (await fetch(req)).json();
                if (req.error) throw req.error;
                items = items.concat(req.items);
            }
            response = {items};
        } else if (typeof request === "string") {
            response = await (await fetch(request)).json();
            if (response.error) throw response.error;
        }

        return response;
    }
}