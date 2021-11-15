const {YouTubeProfile, YouTubeVideo, YouTubeCommunityPost} = require("../lib/YouTube");

const {TwitchClient} = require("../lib/Twitch");
const {TagMatcher} = require("../lib");

let ws              = require("ws");


let mongodbGetall = require("../util/mongodb-getall");
let {youtubeReady, twitcastingReady, twitchReady} = require("./ready");
const {changeStreams} = require("../db");
const VTuber = require("../lib/VTuber");
const { TwitcastingClient } = require("../lib/Twitcasting");


module.exports = {
    once: true,
    event : "ready",
    
    async callback(server) {
        // load & expose metrics
        let pm2 = require("../pm2");

        for (const endpoint of require("../rest")) {
            server.api.rest.add(endpoint);
        }

        server.twitchClient = new TwitchClient(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);
        let {accessToken} = await server.twitchClient.fetchAppAccessToken();
        process.env.TWITCH_APP_ACCESS_TOKEN = accessToken;
        server.twitchClient.autoFetch("accessToken", (token) => process.env.TWITCH_APP_ACCESS_TOKEN = token);
    

        let {db} = server;
        
        for (const matcher of await mongodbGetall(db.collection("tag_matchers"))) {
            let m = new TagMatcher(server, matcher);
            console.log(`Loaded matcher: ${m}`);
        }

        if (process.argv.includes("--reformat-vtubers")) await require("../db/cleanup/reformat-vtubers")(db);

        if (!db.collection("vtubers")) await db.createCollection("vtubers");
        if (!db.collection("known_ids")) await db.createCollection("known_ids");

        if (!process.argv.includes("--no-youtube"))     await youtubeReady(server);
        //if (!process.argv.includes("--no-twitcasting")) await twitcastingReady(server);
        if (!process.argv.includes("--no-twitch"))      await twitchReady(server);
        

        for (const dbVtuber of await mongodbGetall(db.collection("vtubers"))) {
            let vtuber = new VTuber(dbVtuber);
            console.log(`Loaded: ${vtuber.name}.`)
            await vtuber.doSetup(server.config);
        }


        server.twitcastingClient = new TwitcastingClient(process.env.TWITCASTING_CLIENT_ID, process.env.TWITCASTING_CLIENT_SECRET, process.env.TWITCASTING_REDIRECT_URL);


        // do initial pass of all found videos to set initial status
        for (const apiVideo of (await require("../getters/util/video-batcher").fetch()).items) {
            let video = new YouTubeVideo(apiVideo.id);
            if (video.status === undefined) video.update(apiVideo);
            if (video.status === "offline" && (!await db.collection("known_ids").findOne({_id: video.id}))) await db.collection("known_ids").insertOne({_id: video.id, type: "yt_video"});
        }
        
        server.hub.register(require(`${__dirname}/../getters/youtube-videos.js`));

        console.log("Main initialization logic done.");
    }
};