require("dotenv").config({path: "../.env"});
require("../src/util/prototype-extensions");

let {TwitchChannel, TwitchClient, TwitchStream} = require("../src/lib/Twitch");

async function main() {
    let {accessToken} = await new TwitchClient(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET).fetchAppAccessToken();
    process.env.TWITCH_APP_ACCESS_TOKEN = accessToken;

    let user = await TwitchChannel.fetchFromName("anny");
    await user.fetchLive();

    console.log(user.stream);
}

main();