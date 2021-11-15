const { default: fetch } = require("node-fetch");
const { TwitchChannel } = require(".");

async function cleanupTwitchWebhooks() {
    let subscriptions = await (await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions`, {headers: {"Client-ID": process.env.TWITCH_CLIENT_ID, "Authorization": `Bearer ${process.env.TWITCH_APP_ACCESS_TOKEN}`}})).json();

    for (const sub of subscriptions.data) {
        if (sub.type === "stream.online" || sub.type === "stream.offline") {
            console.log("Unsubscribing from", sub.id);
            let result = await TwitchChannel.unsubscribeFrom(sub.id);
            if (typeof result === "object") console.log(result);
        }
    }
}

module.exports = {cleanupTwitchWebhooks};