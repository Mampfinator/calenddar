module.exports = [
    // general ones
    require("./vtubers"),
    require("./vtubers-find"),

    // youtube
    require("./youtube-stream-status"),
    require("./youtube-upcoming"),

    // twitch

    // twitcasting

    // webhook listeners
    require("./webhook-listeners/youtube"),
    require("./webhook-listeners/twitcasting"),
    require("./webhook-listeners/Twitch/twitch"),

    // oauth2 (experimental)
    require("./oauth2/twitcasting")
]