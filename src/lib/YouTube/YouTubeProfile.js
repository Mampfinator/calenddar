const pubSubHubbub          = require("pubsubhubbub");
const YouTubeVideo          = require(`./YouTubeVideo.js`);
let {retryFetch, 
    ytInitialData, 
    resolveTab}             = require("./functions");
const YouTubeCommunityPost  = require("./YouTubeCommunityPost.js");

const {videoFeedParser}     = require("./util");

const server = require("../../server");
let {address, callbackPaths} = server.config;

class YouTubeProfile {
    static pubsub = pubSubHubbub.createServer({callbackUrl:`${address}${callbackPaths.youtube}`, leaseSeconds: 30});
    /**
     * @type {string}
     */
    id;
    /**
     * @type {Object<string, YouTubeVideo>}
     */
    videos;
    /**
     * @type {Object<string, YouTubeCommunityPost>}
     */
    posts;
    /**
     * @type {Array<VTuber>}
     */
    vtubers = new Map();

    [Symbol.toPrimitive](hint) {
        if (hint === "string") return `YouTubeProfile(${this.id}) => {videos: ${this.videos.size}, posts: ${this.posts.size}}`

        return this.toString();
    }

    /**
     * 
     * @param {string} id 
     * @returns {YouTubeProfile|undefined}
     */
    static get(id) {
        return this.__profiles.get(id);
    }
    
    /**
     * @returns {Array<YouTubeProfile>} - a new Array of all YouTubeProfiles.
     */
    static getAll() {
        return [...this.__profiles.values()];
    }

    constructor(id) {
        if (this.constructor.get(id)) return this.constructor.get(id);

        this.id = id;
        this.videos = new Map();
        this.posts = new Map();

        YouTubeProfile.__profiles.set(id, this);

        return this;
    }

    /**
     * @returns {Promise<Map<string, YouTubeVideo>>|undefined} - returns undefined if no new video IDs were found.
     */
    async fetchNewVideos() {
        
        let {items} = await videoFeedParser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${this.id}`);
        let newVideos = new Map();
        for (let video of items) {
            if (!this.videos.get(video.videoId)) {
                video = YouTubeVideo.from(video, "rss");

                newVideos.set(video.id, video);
                this.videos.set(video.id, video);
            }
        }

        if (newVideos.size > 0 && !arguments[0]) return newVideos;
    }

    /**
     * @param {boolean} onlyReturnNew - if set to true, returns only an Array of new posts.
     * @returns {Promise<Object<string, Map<string, YouTubeCommunityPost>>>|Promise<Map<string, YouTubeCommunityPost>>}
     */
    async fetchCommunityPosts(onlyReturnNew = false) {
        const communityData = await retryFetch(`https://www.youtube.com/channel/${this.id}/community`, ytInitialData, 5, {text: true, returnCondition: true});
        let posts = Object.searchKeys(resolveTab(communityData || {}), "backstagePostRenderer");

        let ret = {known: new Map(), new: new Map()};

        for (const post of posts) {
            let isKnown = YouTubeCommunityPost.get(post.postId);
            let p = YouTubeCommunityPost.from(post, "initialData");

            this.posts.set(p.id, p);

            if (isKnown) ret.known.set(p.id, p);
            else ret.new.set(p.id, p);
        }

        if (onlyReturnNew) return ret.new;
        return ret; 
    }

    subscribe() {
        YouTubeProfile.pubsub.subscribe(`https://www.youtube.com/xml/feeds/videos.xml?channel_id=${this.id}`, `https://pubsubhubbub.appspot.com/`);
    }

    unsubscribe() {
        YouTubeProfile.pubsub.unsubscribe(`https://www.youtube.com/xml/feeds/videos.xml?channel_id=${this.id}`, `https://pubsubhubbub.appspot.com/`);
    }

    export() {
        let {videos, posts, id} = this;

        return {
            id,
            videos: [...videos.values()].filter(v => !v.partial && v.status !== "offline").map(v => v.export()),
            posts: [...posts.values()].map(p => p.export())
        }
    }
}

YouTubeProfile.pubsub.on("subscribe", ({topic, lease}) => {
    let channelId = topic.split("=")[1];
    let profile = YouTubeProfile.get(channelId);
    
    if (!profile || profile.awaitingUnsubscribe) return;

    console.log(`Subscribed to ${topic}. Resubscribing in less than ${lease}.`);

    setTimeout(profile.subscribe.bind(profile), Math.max(lease - 10000, 10000));
}); 

Object.defineProperty(YouTubeProfile, "__profiles", {value: new Map()});

module.exports = YouTubeProfile;