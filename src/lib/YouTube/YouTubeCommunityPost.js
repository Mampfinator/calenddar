let {retryFetch, ytInitialData} = require("./functions");

class YouTubeCommunityPost {
    /**
     * @type {boolean} - whether it's a full structure or missing info.
     */
    partial;

    /**
     * 
     * @param {string} id 
     * @returns {YouTubeCommunityPost|undefined}
     */
    static get(id) {
        return this.__posts.get(id);
    }

    /**
     * 
     * @returns {Array<YouTubeCommunityPost>}
     */
    static getAll() {
        return [...this.__posts.values()];
    }

    /**
     * 
     * @param {object} source 
     * @param {string} hint 
     * @returns {YouTubeCommunityPost}
     */
    static from(source, hint) {
        if (hint === "initialData") {            
            if (source.contents) source = source.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0];
            if (source.backstagePostThreadRenderer) source = source.backstagePostThreadRenderer;
            if (source.post) source = source.post;
            if (source.backstagePostRenderer) source = source.backstagePostRenderer;

            let {contentText, backstageAttachment, publishedTimeText, voteCount} = source;

            let p = new this(source.postId);
            p.partial = false;
            p.text = contentText.runs.map(r => r.text).join("");

            /* rest of the transformations go here */
            return p;
        } 
    }

    constructor(id) {
        if (this.constructor.get(id)) return this.constructor.get(id);
        this.constructor.__posts.set(id, this);

        Object.defineProperties(this, {
            partial: {writable: true, enumerable: false}
        });

        this.id = id;
    }

    /**
     * @returns {Promise<YouTubeCommunityPost>}
     */
    async fetch() {
        let data = ytInitialData(await retryFetch(`https://www.youtube.com/post/${this.id}`, (res) => ytInitialData(res), 5, {text: true}));

        this.constructor.from(data, "initialData");
        return this;
    }

    export() {
        let {id, channel, text, attachment, votes} = this;

        return {
            id, channel, text, attachment, votes
        }
    }
}

Object.defineProperty(YouTubeCommunityPost, "__posts", {value: new Map()});

module.exports = YouTubeCommunityPost;