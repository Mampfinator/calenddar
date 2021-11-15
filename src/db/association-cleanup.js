const {mongodbGetAll} = require("../util");

module.exports = async function associationCleanup(server) {
    for (const {_id} of await mongodbGetAll(server.db.collection("youtube_profiles").find())) {
        if (!(await server.db.collection("vtubers").findOne({youtube_id: _id}))) server.db.collection("youtube_profiles").delete({_id});
    }

}