const express   = require("express");
const expressWs = require("express-ws");
const EventListener = require("events");

const {EndpointManager, WebhookManager} = require("../Managers");

module.exports = class DDAPI extends EventListener {
    
    constructor(server, options) {
        super();

        this.server = server;

        // central webserver
        this.app = express();
        // everything WebSocket related below this
        this.wss = expressWs(this.app).getWss();
        this.wssRouter = express.Router();

        // for now just use /ws as route; might change in the future.
        this.wssRouter.ws(options?.wssPath || "/ws", ...(options?.wssMiddlewares ?? []), (ws, req) => {
            // FIXME Investigate why clients randomly get disconnected and don't reconnect. (might also be client-side & nginx proxy timeout)
            /*ws.subscriptions = {
                enableAll: false,
                platforms: []
            };*/

            /*let {filter} = req;

            if (filter.platform) {
                let {platform} = filter;
                if (platform.includes("all")) ws.subscriptions.enableAll = true;
                else {
                    ws.subscriptions.platform.push(...platform);
                }
            }*/

            /*let {platforms} = this.server.config;
            let query = [...Object.entries(req.query)].map(q => {return {platform: q[0], ids: q[1].split(",")}});*/
            
            // if there are no filters in the query, just enable everything
            /*if (query.length === 0) ws.subscriptions.enableAll = true;
            else {
                for (const {platform, ids} of query) {
                    if (platforms.includes(platform)) {
                        let enableAll = ids.includes("all");
                        ws.subscriptions.platforms.push({
                            platform, enableAll, ids: ids.filter(id => id !== "all")
                        });
                    } else return ws.close(400, JSON.stringify({error: {code: 400, description: "badParameter", details: platform}}));
                }
            }*/

            // TODO reference VTubers in Platform Profiles somehow
            let {events, vtubers} = req.query;

            if (!events instanceof Array) events = [events];
            events = events.join(",").split(";").map(e => {
                let [platform, events] = e.split(":");
                return {
                    platform,
                    events: events || "all"
                }
            });

            if (!vtubers instanceof Array) vtubers = [vtubers];
            for (const vtuber of vtubers) {
                let {VTuber} = require("../../../lib");
            }

            ws.isAlive = true;

            ws.send(JSON.stringify({event: "welcome", message: this.server.config?.wssWelcomeMessage || `Welcome to DDataBase Version ${this.server.config?.version || process.env.VERSION || "(version goes here :OkayuHeh:)"}`}));
            websocketMessages.mark();


            // whenever the client responds to a ping, mark it as alive again.
            ws.on('pong', () => {
                ws.isAlive = true;
            });

            // destroy all inactive clients & mark them for termination if they don't respond before the next sweep
            ws.interval = setInterval(() => {
                if (ws.isAlive === false) return ws.terminate();
                ws.isAlive = false;
                ws.ping(() => {});
            }, 15000); // 15 seconds ought to be enough to respond.
        });
        
        this.rest = new EndpointManager(this.server);
        this.webhooks = new WebhookManager(this.server);
    }


    relay(event, data) {
        const platform = event.split(":")[0].toLowerCase();

        const subscribedSockets = [...this.wss.clients.values()].filter((ws) => {
            if (ws.subscriptions.enableAll) return true; 
            let platformDescriptor =  ws.subscriptions.platforms.find(p => p.platform === platform);
            if (!platformDescriptor) return false;
            if (platformDescriptor.enableAll || platformDescriptor.ids.includes(data.channel_id ?? data.user_id)) return true;
        });

        console.log(`Received Event "${event}" (detected platform: ${platform}). Sending out ${data} notification to ${subscribedSockets.length} client(s).`);

        if (typeof data.export === "function") data = data.export();

        for (const client of subscribedSockets) {
            client.send(JSON.stringify({event, data}));
        }
        this.webhooks.post(event, data);
    }

    async start() {
        this.app.use(this.wssRouter, this.rest.router);
        await this.rest.start();

        // start the server and return only once it's done.
        this.port = this.server.config?.port ?? process.env.API_PORT ?? require("../Util/defaults").API_PORT;
        let {port} = this;
        await new Promise((res) => {
            this.app.listen(port, () => {
                res();
            });
        });
        
        this.server.emit("api-ready");
    }
}