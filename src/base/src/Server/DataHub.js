const EventEmitter      = require("events");
const fetch             = require("node-fetch");
const DynamicInterval   = require("../structures/DynamicInterval");

async function intervalFunction(_, server, method) {

    try {
        // if we get a string instead of a function, we can assume that the getter is a link and try to fetch it
        if (typeof method.getter === "string") method.getter = async () => (await fetch(method.getter)).text();  
        var data = await method.getter(server);

        // if no data is returned, don't bother executing further.
        if (!data) return;
        
        // if there is a transform function attached to a method, overwrite data with its result
        if (method.transform) data = await method.transform(data, server);
    } catch (error) {
        return server.hub.emit("error", {method, error});
    }

    server.hub.emit(method.event, data);
}

module.exports = class DataHub extends EventEmitter {
    constructor(server) {
        super();

        this.server = server;
        this.methods = new Map();

        this.cache = {}; // set up a cache object that the user can use to keep track of things
    }

    /**
     * @typedef     {Object}                DataMethod
     * @prop        {string}                event
     * @prop        {number}                [interval]
     * @prop        {function|string}       getter
     * @prop        {DataHub~transform}     [transform]
     * @prop        {DataHub~callback}      callback
     */

    /**
     * @callback    DataHub~transform
     * @param       {object}                data
     * @param       {DataHub}               hub 
     */

    /**
     * @callback    DataHub~callback
     * @param       {object}                data
     * @param       {DataHub}               hub 
     */


    /**
     * @param {DataMethod} method 
     */
    register(method) {

        method.caller = new DynamicInterval(intervalFunction, method.interval, this.server, method);
        method.caller.start();


        this.on(method.event, (data) => {
            method.callback(data, method, this.server);
        });

        this.methods.set(method.event, method);
    }
}