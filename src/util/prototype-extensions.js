Array.prototype.fastFilter = function fastFilter(filter) {
    let results = [];
    for (let i = 0; i < this.length; i++) {
        if (filter(this[i])) results.push(this[i])
    }
    return results;
}

let search = (object, keys, results) => {
    Object.keys(object).some((k) => {
        if (keys.includes(k)) {
            results.add(object[k]);
        }
        if (object[k] && typeof object[k] === "object") {
            search(object[k], keys, results);
        }
    });
}

Object.searchKeys = function searchKeys(object, ...keys) {
    let results = new Set();
    search(object, keys, results);
    return Array.from(results.keys());
}

/**
 * @typedef {Object} inputMapObject
 * @property {Array<string>} from
 * @property {string} to 
 */
/**
 * @param {Array<inputMapObject>} inputMap 
 * @param {Object} input 
 * @returns {Object} - object mapped as defined in inputMap.
 */
Object.remap = function remap(inputMap = [], input = {}) {
    let o = {};
    for (const [key, value] of Object.entries(input)) {
        let m = inputMap.find(i => i.from.includes(key));
        if (!m) continue;
        o[m.to] = value;
    }

    return o;
}

/**
 * 
 * @param {object} object 
 * @param {object} ruleSet 
 * @param {boolean} strict - return false if any key in object is not present in ruleSet. 
 */
Object.verify = function verify(object, ruleSet, strict = true) {
    for (const [key, value] of Object.entries(object)) {
        if (ruleSet[key] !== true && typeof value !== ruleSet[key] && !(value instanceof ruleSet[key]) && (strict && ruleSet[key] !== undefined)) {
            return false;
        }
    }
    return true;
} 