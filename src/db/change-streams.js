const VTuber = require("../lib/VTuber");

module.exports = async function({db, config}) {
    let vtuberUpdates = db.collection("vtubers").watch({fullDocument: "updateLookup"});
    vtuberUpdates.on("change", async ({documentKey, fullDocument, operationType}) => {
        console.log("Detected vtuber collection change: ", documentKey, operationType);
        if (operationType           === "insert") {
            let vtuber = new VTuber(fullDocument);
            await vtuber.doSetup({domain: config.domain, callbackPaths: config.callbackPaths});
        } else if (operationType    === "update") {
            console.log("VTuber updated :LutoSweat:");
        }
    });
}