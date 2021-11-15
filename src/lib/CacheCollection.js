/**
 * @description - functions almost like a map but stores last access times along with the actual value, and also includes sweeping functionality to reduce memory usage.
 */
// TODO Actually implement this in all classes with caches
module.exports = class CacheCollection {
    autoSweep = false;
    
    // TODO add optional sweepCallback if automatic removing is not what you'd want; i.e. replacing a full object with a partial
    constructor(sweepFilter, sweepInterval) {
        Object.defineProperty(this, "__items", {value: new Map(), enumerable: false});
        Object.defineProperty(this, "__sweepFilter", {value: sweepFilter});

        if (sweepTimeout) {
            this.__sweepInterval = setInterval(this.__sweepFilter.bind(this), sweepInterval || 1000*60*60);
            this.autoSweep = true;
        }
    }


    set(key, value) {
        this.__items.set(key, {
            value,
            lastAccessed: Date.now(),
            created: Date.now()
        });
    }

    get(key) {
        let item = this.__items.get(key);
        if (item) item.lastAccessed = Date.now();

        return item.value;
    }

    delete(key) {
        return this.__items.delete(key);
    }

    sweep() {
        for (const [key, value] of this.__items.entries()) {
            if (!this.__sweepFilter(key, value.value, value.lastAccessed)) this.delete(key);
        }
    }
}