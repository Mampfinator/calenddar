const BaseManager = require("./BaseManager");
const fetch         = require("node-fetch");

module.exports = class WebhookManager extends BaseManager {
    post(event, data) {
        for (const webhook of Array.from(this.entries).filter(hook => hook.events.includes(event))) {
            webhook.post({event, message: data});
        }
    }
}