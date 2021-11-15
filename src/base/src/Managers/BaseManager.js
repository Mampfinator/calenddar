module.exports = class Manager {
    constructor(server) {
        this.server = server;
        this.entries = new Map();
        /**
         * @private
         */
        this.tasks = [];
    }


    addTask(task) {
        this.tasks.push(task);
        return this;
    }


    async start(options) {
        for (let task of this.tasks) {
            if (typeof task === "function") task = task(options);
            await task;
        }
    }
}