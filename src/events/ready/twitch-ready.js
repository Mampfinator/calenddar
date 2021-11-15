const mongodbGetall = require("../../util/mongodb-getall");
const {TwitchChannel, TwitchClient} = require("../../lib/Twitch");
const fixTwitchProfiles = require("../../db/cleanup/fix-twitch-profiles");
const {cleanupTwitchWebhooks} = require("../../lib/Twitch/functions")

module.exports = async function twitchReady(server) {
    if (process.argv.includes("--fix-twitch-profiles")) await fixTwitchProfiles(server);
    if (!process.argv.includes("--skip-webhook-cleanup")) await cleanupTwitchWebhooks(server);
}