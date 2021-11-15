module.exports = {
    event: "error",
    once: false,
    callback(error, method) {
        console.log(`Got error in method ${method}: \n`, error);
    }
}