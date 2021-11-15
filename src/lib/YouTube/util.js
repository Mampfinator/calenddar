const Parser = require("rss-parser");

module.exports = {
    videoFeedParser: new Parser({customFields: {
        // title = channel name
        feed: ["title"],
    
        // standard id field is prefixed with yt:video:; string.replace is an option, but could be slow for high traffic
        item: [["yt:videoId", "videoId"]]
    }}
    )
}