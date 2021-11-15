/**
 * 
 * @param {object} data 
 * @param {*} flags 
 * @returns {func} - callback that was registered for the corresponding keys.
 */

let handlers = [];

function handleData(data, flags) {
    let keys = [...Object.keys(data)];
    let handler = handlers.find((value) => {
        let {keywords} = value;
        for (const key of keys) {
            if (!keywords.includes(key)) return false; 
        }

        return true;
    });

    if (!handler) return;
    return handler.callback;
}

handleData.register = (function register(keywords, callback) {
    this.handlers.push({keywords, callback});
}).bind(handleData);

handleData.handlers = handlers;

module.exports = handleData;