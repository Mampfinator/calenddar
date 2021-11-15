module.exports = class Endpoint {
    validate(req, endpoint) {
        // actual validation logic....
        // soon:tm:
        /*
        basic idea is, user passes a validationRules object, which can look a little like this:
        {

        }
        */
       // soon:tm:
    }

    constructor(path, method, callback, validationRules) {
        this.path = path;
        this.method = method; 
        this.callback = callback;
        this.rules = validationRules
    }

    validate(req) {
        Endpoint.validate(req, this);
    }
}