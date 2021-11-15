const { TwitchChannel, TwitchStream } = require("../../../../lib/Twitch");
const {LIVE} = require("../../../../util/events").TWITCH;

module.exports = async (server, subscription, event) => {
    let {broadcaster_user_id} = event;

    let channel = new TwitchChannel(broadcaster_user_id);
    await channel.fetchLive();

    if (channel.stream === null) throw new Error(`Expected channel ${channel.id} (${channel.loginName}, ${channel.displayName}) to be live; was offline.`);

    server.api.relay(LIVE, channel.stream.export());
}