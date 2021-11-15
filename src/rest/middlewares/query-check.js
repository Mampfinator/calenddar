module.exports = (req, res, next) => {
    let {query} = req;
    let {endpoint} = req;

    if (!(endpoint?.rules)) next();

    let invalid = []; 

    for (const [key, value] of Object.entries(query)) {
        if (!endpoint.rules[key]) invalid.push({key, value, reason: "unknownParameter"});
        if (    (typeof endpoint.rules[key] == "function" && !endpoint.rules[key](value)) || 
                (typeof endpoint.rules[key] == "object" && !(value instanceof endpoint.rules[key])) ||
                (typeof endpoint.rules[key] == "string" && !(typeof value == endpoint.rules[key]))
        ) invalid.push({key, value, reason: "parameterValidationFailed"});
    }


    if (invalid.length > 0) {
        return res.status(400).json({error: "invalidQueryParameter", details: invalid});
    }

    next();
}