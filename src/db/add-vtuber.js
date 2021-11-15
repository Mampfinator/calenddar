const {YouTubeProfile} = require("../lib/YouTube");
const {TwitchChannel} = require("../lib/Twitch");
const youtubeSetup      = require("./youtube-setup");
const VTuber = require("../lib/VTuber");

module.exports = async function addVtuber(server, sourceVtuber) {
    let {db} = server;

    let vtuber = Object.remap(
        [
            {from: ["name"], to: "name"},
            {from: ["originalName", "original_name", "nameOriginal", "name_original"], to: "originalName"},
            {from: ["affiliation"], to: "affiliation"},
            {from: ["youtubeId", "youtube_id"], to: "youtubeId"},
            {from: ["twitchId", "twitch_id"], to: "twitchId"},
            {from: ["twitcastingId", "twitcasting_id"], to: "twitcastingId"},
            {from: ["bilibiliId", "bilibili_id"], to: "bilibiliId"},
            {from: ["niconicoId", "niconico_id"], to: "niconicoId"}
        ], sourceVtuber
    );

    // since getting Twitch channel IDs without use of the API is a pain, addVtuber can interpret vtuber.twitchId as a channel name instead of an ID and fetch the proper ID from the API.
    if (vtuber.twitchId && (isNaN(Number(vtuber.twitchId)))) vtuber.twitchId = (await TwitchChannel.fetchFromName(vtuber.twitchId)).id;
    
    
    let {_id} = await server.db.collection("vtubers").insertOne(vtuber);

    console.log(`Inserted VTuber with name ${name} into database. Assigned ID: ${_id}.`);

    vtuber = new VTuber({...vtuber, _id});
    await vtuber.doSetup(server.config);

    return vtuber;
}