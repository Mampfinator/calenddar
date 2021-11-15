module.exports = {
    handleEvent: require("./handleEvent"),
    events: {
        online: require("./stream.online"),
        offline: require("./stream.offline")
    }
};