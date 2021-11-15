const {VTuber} = require("../lib");

module.exports = {
    method: "GET",
    path: "/vtubers",
    callback: async (req, res, _, server) => {
        let {id} = req.query;

        if (!id) {
            const vtubers = [...VTuber.__vtubers.values()].map(v => v.export());
            return res.json({vtubers});
        } else {
            let vtuber = VTuber.__vtubers.get(req.params.id);
            if (!vtuber) return res.status(404).json({error: "notFound"});
            res.json(vtuber.export(true));
        }
    }
}