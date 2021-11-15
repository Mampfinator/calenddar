const { YouTubeVideo }      = require("../lib/YouTube");
const videoBatcher          = require("./util/video-batcher");

const {NEW_UPLOAD, NEW_STREAM, NEW_RESERVATION, RESERVATION_LIVE, STREAM_OFFLINE, RESERVATION_MOVED} = require("../util/constants").events.YOUTUBE; 

const statusHandler = new Map([
    [undefined, new Map()],
    ["live", new Map()],
    ["upcoming", new Map()]
]);

statusHandler.get(undefined).set("offline", async (server, video) => {
    server.api.relay(NEW_UPLOAD, video);
    await server.db.collection("known_ids").insertOne({_id: video.id, type: "yt_video"});
});
statusHandler.get(undefined).set("live", (server, video) => {
    server.api.relay(NEW_STREAM, video);
});
statusHandler.get(undefined).set("upcoming", (server, video) => {
    server.api.relay(NEW_RESERVATION, video);
});

statusHandler.get("live").set("offline", (server, video) => {
    server.api.relay(STREAM_OFFLINE, video);
});

statusHandler.get("upcoming").set("live", (server, video) => {
    server.api.relay(RESERVATION_LIVE, video);
});


module.exports = {
    event: "YOUTUBE:VIDEOS",
    interval: () => {
        return (Math.ceil(YouTubeVideo.getAll().fastFilter(v => v.status !== "offline").length/50)*12500)
    },

    async getter(server) {
        let {items} = await videoBatcher.fetch();
        return items;
    },

    async callback(videos, method, server) {
        let returnedVideos = new Map();

        for (const apiVideo of videos) {
            let video = new YouTubeVideo(apiVideo.id);
            let {status, scheduledStartTime} = video;
            returnedVideos.set(video.id, video);

            video.update(apiVideo);
            
            //TODO replace with nested map lookup; test properly
            /*if (status !== video.status) {
                console.log(`Status changed for ${video.id}: ${status} => ${video.status}`);
                if (!status) { // new video
                    if      (video.status === "offline")    {
                        server.api.relay(NEW_UPLOAD, video.export());
                        await server.db.collection("known_ids").insertOne({_id: video.id, type: "yt_video"});
                    }
                    else if (video.status === "live")       server.api.relay(NEW_STREAM, video);
                    else if (video.status === "upcoming")   server.api.relay(NEW_RESERVATION, video);

                } else {
                    if      (status === "live" && video.status === "offline")   {
                        server.api.relay(STREAM_OFFLINE, video);
                        await server.db.collection("known_ids").insertOne({_id: video.id, type: "yt_video"});
                    }
                    else if (status === "upcoming" && video.status === "live")  server.api.relay(RESERVATION_LIVE, video);
                }
            } else {*/
                if (status !== video.status) {
                    handler = statusHandler.get(status)?.get(video.status);
                    try {
                        await handler(server, video);
                    } catch (e) {
                        console.log(e);
                    }
                }


                if (video.status === "upcoming" && (Number(scheduledStartTime) !== Number(video.scheduledStartTime))) {
                    console.log(`Reservation time change detected: ${scheduledStartTime.toUTCString()} => ${video.scheduledStartTime.toUTCString()}`);
                    server.api.relay(RESERVATION_MOVED, {...video.export(), previous_scheduled_start_time: scheduledStartTime});
                }                
            //}
        }
    }
}