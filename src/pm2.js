const io        = require("@pm2/io");

const {YouTubeVideo, YouTubeCommunityPost, YouTubeProfile} = require("./lib/YouTube");

const server    = require("./server");

io.action("yt_debug", {}, (param, reply) => {
    reply({
        videos: YouTubeVideo.getAll().length,
        active_videos: YouTubeVideo.getAll().filter(v => v.status !== "offline").length,
        profiles: YouTubeProfile.getAll().length,
        posts: YouTubeCommunityPost.getAll().length
    });
})

io.action("add_vtuber", {}, async (param, reply) => {
    try {param = JSON.parse(param)}
    catch (e) {
        return reply(`Failed parsing provided JSON: ${e}`);
    }
    
    let {addVtuber} = require("./db");
    let result = await addVtuber(server, param);

    reply(`Added VTuber ${JSON.stringify(result)} to the database. `);
});

module.exports = {
    youtubeStats: {
        trackedVideos: io.metric({
            name: "YouTube: tracked videos",
            value: function() {return YouTubeVideo.getAll().filter(v => v.status !== "offline").length}
        }),
        webhookTracker: io.meter({
            name: "YouTube: pubsub WebHooks/hr",
            timeframe: 60*60
        }),
        requestTracker: io.meter({
            name: "YouTube: requests/min",
            timeframe: 60
        })
    },

    twitchStats: {
        requestTracker: io.meter({
            name: "Twitch: req/min",
            timeframe: 60
        }),
        webhookTracker: io.meter({
            name: "Twitch: WebHooks/hr",
            timeframe: 60*60
        }),
    },

    twitcastingStats: {
        requestTracker: io.meter({
            name: "Twitcasting: req/min", 
            timeframe: 60
        }),
        webhookTracker: io.meter({
            name: "Twitcasting: WebHooks/hour",
            timeframe: 60*60
        })
    },

    websocketStats: {
        clients: io.metric({
            name: "WebSocket: connected clients",
            value: function() {return server.api.wss.clients.size}
        }),
        
        messageTracker: io.meter({
            name: "WebSocket: messages/hr",
            timeframe: 60*60
        })
    }
}