const {YouTubeProfile, YouTubeVideo, YouTubeCommunityPost} = require("../../lib/YouTube");
const mongodbGetall = require("../../util/mongodb-getall");
const pubSubHubbub = require("pubsubhubbub");


const {videoFeedParser} = require("../../lib/YouTube");
const { youtubeStats } = require("../../pm2");
let sleep = async (ms) => new Promise(res => setTimeout(res, ms));

module.exports = async function youtubeReady({db, api, config}) {
    if (!db.collection("youtube_profiles")) await db.createCollection("youtube_profiles");

    // load old known IDs from the database.
    let knownPosts = await mongodbGetall(db.collection("known_ids"), {type: "yt_community_post"})
    for (const {_id} of knownPosts) {
        let p = new YouTubeCommunityPost(_id);
        p.partial   = true;
    }
    let knownVideos = await mongodbGetall(db.collection("known_ids"), {type: "yt_video"})
    for (const {_id} of knownVideos) {
        let v = new YouTubeVideo(_id);
        v.status    = "offline";
        v.partial   = true;
    }


    YouTubeProfile.pubsub.on("feed", async ({feed}) => {
        youtubeStats.webhookTracker.mark();
        let {items} = await videoFeedParser.parseString(feed);

        for (const video of items) {

            if (!YouTubeVideo.get(video.videoId)) console.log(`Got notification for new YouTube video: ${video.videoId}`);
            
            // let the batcher handle the rest + fetching from the API.
            YouTubeVideo.from(video, "rss");
        }
    });
}