require("dotenv").config();
const {MongoClient}             = require("mongodb");
const {readdirSync}             = require("fs");

require("./util/prototype-extensions");

const server = require("./server");

console.log("Server located at: ", server.config.address);

new MongoClient(process.env.DATABASE_CONNECTION_STRING).connect()
.then(async (client) => {
    server.db = client.db("calenddar");
    return;
}).then(() => server.start());



for (const eventFile of readdirSync(`${__dirname}/events`).filter(f => f.endsWith(".js"))) {
    let {once, event, callback} = require(`${__dirname}/events/${eventFile}`);
    server[once ? "once" : "on"](event, (...args) => {
        callback(...args, server);
    });
}