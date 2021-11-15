const fetch = require("node-fetch");

/**
 * @typedef {object} initialData
 */

module.exports = {
    /**
     * 
     * @param   {string}        page 
     * @returns {initialData}   initialData
     */
    ytInitialData(page) {
        let result = page.match(/(?<=var +ytInitialData +\=).*?(?=\;\<\/script\>)/);
        try {
            return JSON.parse(result);
        } catch {
            return null;
        }
    },
    /**
     * 
     * @param {string} url 
     * @param {function<boolean>} condition 
     * @param {number} limit 
     * @param {object} options 
     * @returns {*} result
     */
    async retryFetch(url, condition, limit=5, options={}) {
        for (let i = 0; i < limit; i++) {
            let result = await fetch(url);

            if (options.text) result = await result.text();
            else if (options.json) result = await result.json();

            let conditionResult = await condition(result);
            if (conditionResult) {
                if (options.returnCondition) return conditionResult; 
                return result;
            }
        }

        return null;
    },
    /**
     * 
     * @param {initialData} initialData 
     * @returns {object} sectionListRenderer
     */
    resolveTab(initialData){ return initialData.contents?.twoColumnBrowseResultsRenderer?.tabs.find(tab => tab.tabRenderer.selected).tabRenderer.content.sectionListRenderer }
}