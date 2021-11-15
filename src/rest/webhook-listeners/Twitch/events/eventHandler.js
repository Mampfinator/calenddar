class EventHandler{
    events = new Map();

    handle(server, webhookBody) {
        let {subscription, event} = webhookBody;
        let handler = this.events.get(subscription.type);
        if (handler) handler(server, subscription, event);
        else console.log("Unknown event: ", subscription, event, handler);
    }

    register(event, callback) {
        this.events.set(event, callback);
    }
}

let handler = new EventHandler();

handler.register("stream.online", require("./stream.online"));
handler.register("stream.offline", require("./stream.offline"));

module.exports = handler;