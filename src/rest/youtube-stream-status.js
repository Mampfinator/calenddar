const {YouTubeVideo} = require("../lib/YouTube");

module.exports = {
    method: "GET",
    path: "/youtube/video",
    callback: (req, res, _, server) => {
        let {id} = req.query;
        if (!id) return res.status(400).send("invalidParameter: id required.");

        let video = YouTubeVideo.get(id);
        if (!video) return res.json({error: "VIDEO_NOT_FOUND"});

        res.status(200).json(video.export());
    }
}