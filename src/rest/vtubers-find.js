const {VTuber} = require("../lib");
const {YouTubeProfile} = require("../lib/YouTube");
const {TwitchChannel} = require("../lib/Twitch");
const {TwitcastingUser} = require("../lib/Twitcasting");

module.exports = {
    method: "GET",
    path: "/vtubers/find",
    callback: async (req, res, _, server) => {
        let {youtube_id, twitch_id, twitcasting_id, twitter_id, return_all} = req.query;
        
        let candidates = new Map();

        let count = (id) => {
            if (candidates.has(id)) candidates.set(id, ++candidates.get(id));
            else candidates.set(id, 1);
        }

        if (youtube_id) {
            let profile = YouTubeProfile.get(youtube_id);
            if (profile !== undefined) {
                for (const [_id] of profile.vtubers) count(_id);
            }
        }

        
        if (twitch_id) {
            let profile = TwitchChannel.get(twitch_id);
            if (profile !== undefined) {
                for (const [_id] of profile.vtubers) count(_id);
            }
        }

        
        if (twitcasting_id) {
            let profile = TwitcastingUser.get(youtube_id);
            if (profile !== undefined) {
                for (const [_id] of profile.vtubers) count(_id);
            }
        }

        candidates = [...candidates.entries()].sort(([id1, counter1], [id2, counter2]) => counter1 - counter2);

        if (return_all === true || return_all === "true") {
            return res.status(200).json(candidates.map(([id]) => VTuber.get(id).export(true)));
        }

        return res.status(200).json(VTuber.get(candidates[0][0]).export(true));
    }
}