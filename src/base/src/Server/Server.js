const EventEmitter = require("events");

const DDAPI = require("./API");
const DataHub = require("./DataHub");

module.exports = class DDServer extends EventEmitter {
    constructor({api, hub} = {}) {
        super();

        this.api = new DDAPI(this, api);
        this.hub = new DataHub(this, hub);
    }

    async start() {
        await this.api.start(); 
        this.emit("ready", this);
    }
}