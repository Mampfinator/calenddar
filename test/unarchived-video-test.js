require("../src/util/prototype-extensions");

require("dotenv").config({path: "../.env"});

let videoBatcher = require("../src/getters/util/video-batcher");
let {YouTubeVideo} = require("../src/lib/YouTube");

let v = new YouTubeVideo("c5V_b13dLKE");
v.status = "online";



videoBatcher.fetch().then(({items}) => console.log(items));