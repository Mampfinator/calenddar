let mongodbGetall = require("../../util/mongodb-getall");
const {TwitchChannel} = require("../../lib/Twitch");

async function reformatTwitchProfiles(server) {
    let profiles = await mongodbGetall(server.db.collection("twitch_profiles"));

    for (const profile of profiles) {
        console.log(`Reformatting ${profile.id} (${profile._id})`);
        let channel = await TwitchChannel.fetchFromName(profile.id);

        if (channel !== null) await server.db.collection("twitch_profiles").insertOne(channel.export());
        await server.db.collection("twitch_profiles").deleteOne({_id: profile._id});
    }
}

module.exports = async function fixTwitchProfiles(server, {reformat}) {
    if (reformat) await reformatTwitchProfiles(server);
}