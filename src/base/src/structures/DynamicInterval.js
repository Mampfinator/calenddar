// mainly used for YouTube videos
module.exports = class DynamicInterval {
    constructor(callback, intervalGenerator, ...args) {
        this.callback = callback;
        this.args = args;
        if (typeof intervalGenerator === "number") {
            let x = intervalGenerator;
            intervalGenerator = () => x;
        } 
        this.intervalGenerator = intervalGenerator;

        let interval = this;

        this.__internalCallback = async () => {
            let timeout = interval.intervalGenerator(interval)
            await interval.callback(interval, ...interval.args);

            interval.timeout = setTimeout(interval.__internalCallback, timeout);
        }
    }

    start() {
        let interval = this;
        this.timeout = setTimeout(interval.__internalCallback, interval.intervalGenerator(interval), ...interval.args);
    }

    stop() {
        return clearTimeout(this.timeout);
    }
}