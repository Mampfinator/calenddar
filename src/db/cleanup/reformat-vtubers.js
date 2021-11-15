const { TwitchChannel } = require("../../lib/Twitch");
const mongodbGetall = require("../../util/mongodb-getall")

module.exports = async function reformatVtubers(db) {
    for (const vtuber of await mongodbGetall(db.collection("vtubers"))) {
        let {_id, info, name, name_original, youtube_id, twitcasting_id, twitter_id, twitch_id} = vtuber;

        if (isNaN(Number(twitch_id))) twitch_id = (await TwitchChannel.fetchFromName(twitch_id)).id;

        await db.collection("vtubers").replaceOne({_id}, {
            info, 
            name,
            originalName: name_original,
            youtubeId: youtube_id,
            twitcastingId: twitcasting_id,
            twitterId: twitter_id,
            twitchId: twitch_id
        });

        console.log(await db.collection("vtubers").findOne({_id}));
    }
}