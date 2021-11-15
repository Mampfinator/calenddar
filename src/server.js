const { DDServer } = require("./base");
let server = new DDServer({
    api: {
        wssMiddlewares: [require("./rest/middlewares/filter")] 
    }
});
server.config = require("./config.json");

let {domain, https} = server.config;
server.config.address = `${https ? "https":"http"}://${domain}`;

module.exports = server;