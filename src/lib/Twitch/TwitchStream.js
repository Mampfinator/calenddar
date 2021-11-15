const fetch = require("node-fetch");

class TwitchStream {

    [Symbol.toPrimitive](hint) {
        if (hint === "string") return `TwitchStream(${this.id}) => {channel: ${this.channel} (${this.userLogin}), game: ${this.gameId} (${this.gameName})}`
    }

    static from(source, hint) {
        if (hint === "api") {
            let stream = new this(source.id);
            stream.userLogin = source.user_login;
            stream.channel = source.user_id;
            stream.title = source.title;

            stream.startedAt = new Date(source.started_at)

            stream.gameName = source.game_name;
            stream.gameId = source.game_id;

            stream.thumbnail = source.thumbnail_url.replace("{width}", "1280").replace("{height}", "720");
            stream.tags = source.tag_ids;

            return stream;
        } else if (hint === "user") {
            let stream = new this()
        }
    }

    constructor(id) {
        this.id = id;
        if (this.constructor.__streams.get(id)) return this.constructor.__streams.get(id);
        this.constructor.__streams.set(id, this);
    }

    export() {
        let {userLogin, channel, title, startedAt, gameName, gameId, thumbnail} = this;
        return {channel, channel_name: userLogin, title, started_at: startedAt, game_name: gameName, game_id: gameId, thumbnail}
    };
}

Object.defineProperty(TwitchStream, "__streams", {value: new Map()});
module.exports = TwitchStream;