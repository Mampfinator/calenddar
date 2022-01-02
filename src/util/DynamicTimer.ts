export class DynamicTimer {
    private _intervalGenerator: () => number | Promise<number>;
    private _callback: () => void;
    private _internalCallback: () => void;

    private _timeoutId: ReturnType<typeof setTimeout>;

    constructor(
        intervalGenerator: () => number | Promise<number>,
        callback: () => void,
        callbackArgs?: any[],
    ) {
        this._intervalGenerator = intervalGenerator;
        this._callback = callback;

        this._internalCallback = async () => {
            await Reflect.apply(this._callback, this, callbackArgs ?? []);
            const interval = await Reflect.apply(
                this._intervalGenerator,
                this,
                callbackArgs ?? [],
            );
            this._timeoutId = setTimeout(this._internalCallback, interval);
        };
    }

    async start(startImmediate = true) {
        if (startImmediate) await this._callback();
        this._timeoutId = setTimeout(
            this._internalCallback,
            await this._intervalGenerator(),
        );
    }

    stop() {
        clearTimeout(this._timeoutId);
    }
}
