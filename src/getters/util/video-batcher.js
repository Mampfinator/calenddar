const {YouTubeVideo, YouTubeAPIBatcher} = require("../../lib/YouTube");
const {youtubeStats}                         = require("../../pm2");

/**
 * @TODO fix unarchived videos never being detected as offline.
 * - unarchived videos do not return anything from the API when requested.
 * - using a Map id => video to store requested videos & compare those against returned videos should work, marking unreturned videos as offline and setting YouTubeVideo.unarchived to true.
 */

// the main batcher for YouTube videos
module.exports = new YouTubeAPIBatcher(process.env.YOUTUBE_API_KEY, (batcher) => {
    let allVideos = YouTubeVideo.getAll().fastFilter(v => v.status !== "offline");
    
    let batches = [];
    for (let i = 0; i < allVideos.length; i+=50) {
        batches.push(allVideos.slice(i, i+50));
    }
    
    youtubeStats.requestTracker.mark(batches.length);

    return batches.map(videos => {
        return `https://www.googleapis.com/youtube/v3/videos?key=${batcher.key}&id=${videos.map(v => v.id).join(",")}&part=snippet,liveStreamingDetails`
    });
});