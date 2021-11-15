const fetch = require("node-fetch");

let twitcastingFetch = (uri, body, method) => {
    return fetch(uri, {headers: {
        Accept: "application/json",
        "X-Api-Version": "2.0", 
        Authorization: `Basic ${Buffer.from(process.env.TWITCASTING_CLIENT_ID+":"+process.env.TWITCASTING_CLIENT_SECRET).toString("base64")}`
    }, body, method});
}

// TODO Finish implementation
class TwitcastingUser {
    vtubers = new Map();

    constructor(id) {
        this.constructor.__users.set(id, this);
        this.id = id;
    }


    async fetch() {

    }

    // TODO look up way to fetch a Twitcasting ID from a given exact name
    static async fetchFromName() {

    }

    async registerWebhook(liveStart = true, liveEnd = true) {
        let request = {user_id: this.id, events: []};
        if (liveStart) request.events.push("livestart");
        if (liveEnd) request.events.push("liveend");
        
        let res = await twitcastingFetch(`https://apiv2.twitcasting.tv/webhooks`, JSON.stringify(request), "POST");

        return res.json();
    }

    async removeWebhook(liveStart = true, liveEnd = true) {
        let request = {user_id: this.id, events: []};
        if (liveStart) request.events.push("livestart");
        if (liveEnd) request.events.push("liveend");

        let res = await twitcastingFetch(`https://apiv2.twitcasting.tv/webhooks`, JSON.stringify(request), "DELETE");

        return res.json();
    }

    async getStatus() {
        return;
    }

    export() {
        let {status, stream} = this;
        return {status, stream: stream?.export()};
    }
}

Object.defineProperty(TwitcastingUser, "__users", {value: new Map()});

module.exports = TwitcastingUser;