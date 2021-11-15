module.exports = async function getAll(collection, findArg = {}) {
    let ret = [];
    await collection.find(findArg).forEach(e => ret.push(e));
    return ret;
}