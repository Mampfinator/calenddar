const { YouTubeProfile, YouTubeAPIBatcher, YouTubeVideo } = require("../lib/YouTube")

module.exports = async function youtubeSetup(server, youtubeId) {
    
    let profile = new YouTubeProfile(youtubeId);

    let setupVideoBatcher = new YouTubeAPIBatcher(process.env.YOUTUBE_API_KEY, (batcher) => {
        let channelVideos = [...profile.videos.values()].filter(v => v.status !== "offline");
        
        let batches = [];
        for (let i = 0; i < channelVideos.length; i+=50) {
            batches.push(channelVideos.slice(i, i+50));
        }
    
        return batches.map(videos => {
            return `https://www.googleapis.com/youtube/v3/videos?key=${batcher.key}&id=${videos.map(v => v.id).join(",")}&part=snippet,liveStreamingDetails`
        })
    });

    for (const video of await profile.fetchNewVideos()) {
        if (await knownIds.find({_id: video.id})) video.status = "offline";
    }


    for (const video of (await setupVideoBatcher.fetch()).items) {
        let v = new YouTubeVideo(video.id);
        v.update(video);
        if (v.status === "offline" && !(await server.db.collection("known_ids").findOne({_id: video.id}))) await server.db.collection("known_ids").insertOne({_id: video.id, type: "yt_video"});
    }

    for (const post of await profile.fetchCommunityPosts(true)) {
        if (!(await knownIds.find({_id: post.id}))) await knownIds.insertOne({_id: post.id, type: "yt_community_post"});
    }

    await server.api.pubsub.subscribe(`https://www.youtube.com/xml/feeds/videos.xml?channel_id=${youtubeId}`, `https://pubsubhubbub.appspot.com/`);
}