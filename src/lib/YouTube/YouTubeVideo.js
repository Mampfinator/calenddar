const TagMatcher = require("../TagMatcher");

class YouTubeVideo {

    /**
     * @private
     */
    static __videos;

    /**
     * @returns {YouTubeVideo}
     */
    static from(source, hint) {
        if (hint) hint = hint.toLowerCase();
        if (hint === "rss") {
            return new this(source.videoId);
        } else if (hint === "db") {
            let {actualStartTime, scheduledStartTime, actualEndTime, scheduledEndTime, channel, title, description, thumbnail, id} = source;
            
            let v = new this(id);

            v.title                 = title;
            v.description           = description;
            v.thumbnail             = thumbnail;
            v.channel               = channel; 
            
            if (actualStartTime)        v.actualStartTime       = new Date(actualStartTime);
            if (scheduledStartTime)     v.scheduledStartTime    = new Date(scheduledStartTime);
            if (actualEndTime)          v.actualEndTime         = new Date(actualEndTime);
            if (scheduledEndTime)       v.scheduledEndTime      = new Date(scheduledEndTime);

            return v;
        }
    }

    /**
     * 
     * @param {string} id 
     * @returns {YouTubeVideo|undefined}
     */
    static get(id) {
        return this.__videos.get(id);
    }

    /**
     * @returns {Array<YouTubeVideo>}
     */
    static getAll() {
        return [...this.__videos.values()];
    }

    [Symbol.toPrimitive](hint) {
        if (hint === "string") {
            return `YouTubeVideo(${this.id}) => {channel: ${this.channel}, status: ${this.status}, type: ${this.type}}`;
        }
    }

    constructor(id) {
        if (this.constructor.get(id)) return this.constructor.get(id);
        this.constructor.__videos.set(id, this);

        /**
         * @member {string}
         */
        this.id = id;
    }

    update(apiData) {
        if (apiData.id !== this.id) throw new Error("API Data ID did not match own ID.");

        let {snippet, liveStreamingDetails} = apiData;
        let {publishedAt, channelId, title, description, liveBroadcastContent} = snippet;
        /**
         * @member {Date}
         */
        this.publishedAt = new Date(Date.parse(publishedAt));

        /**
         * @member {string}
         */
        this.channel = channelId;
        
        /**
         * @member {string}
         */
        this.title = title;

        this.tags = TagMatcher.matchAll(this.title).map(t => t.tag);

        /**
         * @member {string}
         */
        this.description = description;
        
        /**
         * @member {string}
         */
        this.thumbnail = `https://i.ytimg.com/vi/${this.id}/maxresdefault_live.jpg`;
        
        /**
         * @member {"offline"|"upcoming"|"live"|undefined}
         */
        this.status = liveBroadcastContent === "none" ? "offline": liveBroadcastContent;

        if (liveStreamingDetails) {
            let {actualStartTime, actualEndTime, scheduledStartTime, scheduledEndTime, concurrentLiveViewers} = liveStreamingDetails;

            if (actualStartTime)        this.actualStartTime    = new Date(actualStartTime);
            if (scheduledStartTime)     this.scheduledStartTime = new Date(scheduledStartTime);

            if (actualEndTime)          this.actualEndTime      = new Date(actualEndTime);
            if (scheduledEndTime)       this.scheduledEndTime   = new Date(scheduledEndTime);

            if (concurrentLiveViewers)  this.viewers = concurrentLiveViewers;

            if (scheduledStartTime && scheduledEndTime) this.type = "premiere";
            else if (!scheduledEndTime && !actualEndTime) this.type = "stream";
            else this.type = "video";
        } else this.type = "video";
    }

    export() {
        let {actualStartTime, scheduledStartTime, actualEndTime, scheduledEndTime, title, description, thumbnail, id, channel, tags} = this;

        return {
            id,
            channel,
            title,
            description, 
            thumbnail,
            scheduled_start_time:   scheduledStartTime?.toISOString(),
            actual_start_time:      actualStartTime?.toISOString(),
            scheduled_end_time:     scheduledEndTime?.toISOString(),
            actual_end_time:        actualEndTime?.toISOString(),
            tags
        }
    }
}

Object.defineProperty(YouTubeVideo, "__videos", {value: new Map()});

module.exports = YouTubeVideo;