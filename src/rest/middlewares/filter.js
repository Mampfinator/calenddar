module.exports = (res, req, next) => {
    if (!req.query.filter) {
        console.log("No filter in query.");
        return next();
    }
    if (!(/(?:.+?\:.+?(?:\;|$))+/.test(req.query.filter))) {
        console.log("filter query did not pass validation.");
        return res.status(400).send(JSON.stringify({error: "invalidFilter"}));
    }

    let filter = {};

    for (const toplevelFilter of req.query.filter.split(";")) {

        let [key, value] = toplevelFilter.split(":");
        value = value.split(",");

        filter[key] = value;
    }

    req.filter = filter;

    next();
}