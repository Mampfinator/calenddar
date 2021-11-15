let {callbackPaths} = require("../../config.json");
const {YouTubeProfile} = require("../../lib/YouTube");

module.exports = {
    method: "ALL",
    path: callbackPaths.youtube,
    middlewares: [YouTubeProfile.pubsub.listener()],
    callback:  () => {}
}