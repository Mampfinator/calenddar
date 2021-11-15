class TwitcastingStream {
    /**
     * @private
     * @type {Map<string, TwitcastingStream>}
     */
    static __streams;

    static from(source, hint) {
        if (hint === "api") {
            let {movie, broadcaster} = source;

            let stream = new this(movie.id);

            stream.title = movie.title;
            stream.subTitle = movie.subtitle;
            stream.channel = broadcaster.id;
            
            stream.country = movie.country;
            stream.isCollab = movie.is_collabo;
            stream.isProtected = movie.is_protected;

            stream.status = movie.is_live === true ? "live" : (movie.is_recorded === true ? "recorded" : "offline");
            
            return stream;
        }
    }
    
    constructor(id) {
        this.constructor.__streams.set(id, this);
        this.id = id;
    }

    export() {
        let {id, title, subTitle, channel, country, isCollab, isProtected} = this;
        return {id, title, subtitle: subTitle, channel, country, collab: isCollab, isProtected};
    }
}

Object.defineProperty(TwitcastingStream, "__streams", {value: new Map()});

module.exports = TwitcastingStream;