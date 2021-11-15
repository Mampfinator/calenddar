const {TwitchChannel} = require("../../../../lib/Twitch");
const {OFFLINE} = require("../../../../util/events").TWITCH;
module.exports = async (server, subscription, event) => {
    let {broadcaster_user_id} = event;
    let channel = TwitchChannel.get(broadcaster_user_id);
    channel.stream = null;

    server.api.relay(OFFLINE, channel.export());
}