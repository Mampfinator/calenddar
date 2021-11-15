const BaseManager = require("./BaseManager");
const express = require("express");


module.exports = class EndpointManager extends BaseManager {
    constructor(server) {
        super();
        this.server = server;
        this.router = express.Router();

        this.router.use((req, res, next) => {
            req.endpoint = this.entries.get(req.path);
            next();
        });
    }

    /**
     * @param {Endpoint} endpoint 
     */
    add(endpoint) {
        this.entries.set(endpoint.path, endpoint);
        this.router[endpoint.method.toLowerCase()](endpoint.path, ...(endpoint.middlewares || []), (...args) => {
            endpoint.callback(...args, this.server);
        });
    }
}