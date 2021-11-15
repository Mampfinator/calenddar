const fetch = require("node-fetch");
const TwitchStream = require("./TwitchStream");

class TwitchChannel {
    /**
     * @private
     * @type {Map<string, TwitchChannel>}
     */
    static __channels;
    vtubers = new Map();

    static async fetchFromName(name) {
        let response = await (await fetch(`https://api.twitch.tv/helix/search/channels?query=${name}&first=1`, {headers: {"Client-ID": process.env.TWITCH_CLIENT_ID, "Authorization": `Bearer ${process.env.TWITCH_APP_ACCESS_TOKEN}`}})).json();
        if (response.error) throw response;
        if (response.data?.length > 0) return this.from(response.data[0], "api");
        else return null;
    }

    static get(id) {
        return this.__channels.get(id);
    }

    static getAll() {
        return [...this.__channels.values()];
    }

    static from(source, hint) {
        if (hint === "api") {
            let channel = new this(source.id);
            
            channel.language = source.broadcaster_language;
            channel.displayName = source.user_name || source.broadcaster_name;
            channel.loginName = source.user_login;

            channel.isLive = source.is_live;

            if (channel.isLive) {
                let {game_id, game_name, tag_ids, thumbnail_url, title, started_at} = source;
                channel.stream = TwitchStream.from({game_id, game_name, tag_ids, thumbnail_url, title, started_at}, "user");
            }
            return channel;
        } else if (hint === "db") {
            let channel = new this(source.id);
            channel.displayName = source.displayName;
            channel.loginName = source.loginName;
        }
    }

    constructor(id) {
        this.constructor.__channels.set(id, this);
        this.id = id;
    }
    
    async subscribeTo(event, callbackURL, secret) {
        return (
            await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
                headers: {"Client-ID": process.env.TWITCH_CLIENT_ID, "Authorization": `Bearer ${process.env.TWITCH_APP_ACCESS_TOKEN}`,"Content-Type": "application/json"},
                body: JSON.stringify({
                        type: event,
                        version: 1,
                        condition: {
                            broadcaster_user_id: this.id
                        },
                        transport: {
                            method: "webhook",
                            callback: callbackURL,
                            secret: secret || process.env.TWITCH_WEBHOOK_SECRET
                        }
                    }),
                method: "POST"
            })
        ).json();
    }

    static async unsubscribeFrom(subscriptionId) {
        let result = await (
            await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscriptionId}`,{
                headers: {"Client-ID": process.env.TWITCH_CLIENT_ID, "Authorization": `Bearer ${process.env.TWITCH_APP_ACCESS_TOKEN}`, "Content-Type": "application/json"},
                method: "DELETE"
            })
        ).text();

        return result === "" || JSON.parse(result); 
    }

    async unsubscribeFrom(subscriptionId) {
        return this.constructor.unsubscribeFrom(subscriptionId).apply(this);
    }

    async fetch() {
        if (this.loginName) return await this.constructor.fetchFromName(this.loginName);
        
        let channel =  await (await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${this.id}`,{
            headers: {"Client-ID": process.env.TWITCH_CLIENT_ID, "Authorization": `Bearer ${process.env.TWITCH_APP_ACCESS_TOKEN}`
        }})).json();

        if (channel.error) throw channel;
        
        if (channel.data) channel = channel.data;
        if (channel instanceof Array) channel = channel[0];

        this.constructor.from(channel);
    }

    async fetchLive() {
        let stream =  await (await fetch(`https://api.twitch.tv/helix/streams?user_id=${this.id}`,{
            headers: {"Client-ID": process.env.TWITCH_CLIENT_ID, "Authorization": `Bearer ${process.env.TWITCH_APP_ACCESS_TOKEN}`
        }})).json();

        if (stream.error) throw stream;
        
        stream = stream.data;
        if (stream instanceof Array) stream = stream[0];

        if (stream?.type === "live") {
            this.stream = TwitchStream.from(stream, "api");
        } else {
            this.stream = null;
        }
    }


    export() {
        let {id, displayName, loginName, isLive, stream} = this;
        return {id, display_name: displayName, channel_name: loginName, is_live: isLive || this.stream !== null, stream: stream?.export()}
    }
}

Object.defineProperty(TwitchChannel, "__channels", {value: new Map()});
module.exports = TwitchChannel;