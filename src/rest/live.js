const VTuber = require("../lib/VTuber");

module.exports = {
    method: "GET",
    path: "/live",
    callback: async (req, res, server) => {
        let {id} = req.query;
        if (!id) return res.status(400).json({error: "invalidParameter", details: "idParameterRequired"});

        let vtuber = VTuber.__vtubers.get(id);
        if (!vtuber) return res.status(404).json({error: "notFound"});

        return res.status(200).json(vtuber.export());
    }
}