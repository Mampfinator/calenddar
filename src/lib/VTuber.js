const { TwitcastingUser }   = require("./Twitcasting");
const { TwitchChannel }     = require("./Twitch");
const { YouTubeProfile }    = require("./YouTube");

class VTuber {
    /**
     * @private
     */
    static __defaultInputMap = [
        {   from: ["name", "Name"],                                                     to: "name"              },
        {   from: ["originalName", "original_name", "name_original", "nameOriginal"],   to: "originalName"      },
        {   from: ["youtubeId", "youtube_id"],                                          to: "youtubeId"         }, 
        {   from: ["twitchId", "twitch_id"],                                            to: "twitchId"          }, 
        {   from: ["twitterId", "twitter_id"],                                          to: "twitterId"         },
        {   from: ["twitcastingId", "twitcasting_id"],                                  to: "twitcastingId"     },
        {   from: ["affiliation"],                                                      to: "affiliation"       },
        {   from: ["_id"],                                                              to: "id"                },
    ];

    /**
     * @private
     * @type {Array<VTuber>}
     */
    static __vtubers;

    /**
     * 
     * @param {object} source 
     * @param {function} hint 
     * @returns {VTuber}
     */
    static from(source, hint) {
        if (hint === "db") {
            let vtuber = new this(
                Object.remap(this.__defaultInputMap, source)
            )
            return vtuber;
        }
    }

    /**
     * @param {function} predicate 
     * @returns {Array<VTuber>} - new Array of all VTubers that match the predicate function.
     */
    static find(predicate) {
        return [...this.__vtubers.values()].filter(predicate);
    }

    /**
     * 
     * @param {string} id 
     * @returns {VTuber}
     */
    static get(id) {
        return this.__vtubers.get(id);
    }


    constructor(vtuberObject) {
        let {name, originalName, youtubeId, twitchId, twitterId, twitcastingId, _id, id} = vtuberObject;
        id = id || _id.toString();
        if (id) this.constructor.__vtubers.set(id, this);
        this.id = id;
        this.name = name;
        this.originalName = originalName;

        if (youtubeId) {
            this.youtube = new YouTubeProfile(youtubeId);
            this.youtube.vtubers.set(this.id, this);
        }
        if (twitchId) {
            this.twitch = new TwitchChannel(twitchId);
            this.twitch.vtubers.set(this.id, this);
        }
        if (twitcastingId) {  
            this.twitcasting = new TwitcastingUser(twitcastingId);
            this.twitcasting.vtubers.set(this.id, this);
        }
    }

    // probably not needed anymore
    /*setId(id) {
        this.constructor.__vtubers.delete(this.id);
        this.id = id;
        this.constructor.__vtubers.set(this.id, this);
    }*/

    async doSetup({address, callbackPaths}) {
        //await this.youtube?.fullCrawl(); - WIP
        await this.youtube?.fetchNewVideos();
        await this.youtube?.subscribe();

        await this.twitch?.fetch();
        await this.twitch?.fetchLive();
        await this.twitch?.subscribeTo("stream.online", `${address}${callbackPaths.twitch}`);
        await this.twitch?.subscribeTo("stream.offline", `${address}${callbackPaths.twitch}`);

        await this.twitcasting?.getStatus();
        await this.twitcasting?.registerWebhook(true, true);
    }

    export(fullExport = false) {
        let {twitch, youtube, twitcasting, twitter, name, originalName, id} = this;

        if (!fullExport) return {
            id, name, original_name: originalName, youtube: youtube?.id, twitch: twitch?.id, twitcasting: twitcasting?.id, twitter: twitter?.id
        }

        if (fullExport) return {
            id, name, original_name: originalName, youtube: youtube?.export(), twitch: twitch?.export(), twitcasting: twitcasting?.export(), twitter: twitter?.export()
        }
    }
}

Object.defineProperty(VTuber, "__vtubers", {value: new Map()});

module.exports = VTuber;