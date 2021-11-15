const {YouTubeProfile, YouTubeVideo} = require("../lib/YouTube");

module.exports = {
    method: "GET",
    path: "/youtube/upcoming",
    callback: async (req, res, server) => {
        let upcomingVideos = YouTubeVideo.getAll().filter(v => v.status === "upcoming");
        let upcomingMap = new Map();

        for (const video of upcomingVideos) {
            if (!upcomingMap.get(video.channel)) {
                upcomingMap.set(video.channel, []);
            }

            upcomingMap.get(video.channel).push(video.export());
        }

        let result = [];


        for (const [channel, videos] of upcomingMap) {
            result.push({channel, videos});
        }
        res.status(200).json(result);
    }
}