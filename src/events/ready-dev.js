const ws                        = require("ws");

module.exports = {
    once: true,
    event : "ready",
    async callback(server) {
        if (process.env.NODE_ENV !== "production") {
            console.log("Connecting debug WebSocket.");
            const socket = new ws(`ws://127.0.0.1:${server.api.port}/ws?filter=platform:youtube,twitch`);
            
            socket.on("message", (message) => {
                try {
                    message = JSON.parse(message);
                } catch {};
                console.log("\x1b[38;5;104m%s\x1b[0m", JSON.stringify(message, null, 4));
            });

            socket.on("close", (code, reason) => {
                console.log(`Closed debug WebSocket: ${code} - ${reason}`);
            });

            socket.on("error", console.log);
            socket.on("unexpected-response", console.log);

            socket.on("open", () => console.log("Debug WebSocket connected. WebSocket messages will appear in \x1b[38;5;104mblue\x1b[0m."));
        }
    }
}