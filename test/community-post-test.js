require("../src/util/prototype-extensions");

let {YouTubeCommunityPost, YouTubeProfile} = require("../src/lib/YouTube");

/*let post = new YouTubeCommunityPost("UgzYLOvWiERAOzEqSlV4AaABCQ");

post.fetch();*/

let profile = new YouTubeProfile("UCOSFGQ8d_eLCsjWXwuMh4LA"); 

profile.fetchCommunityPosts(true).then((posts) => {console.log(posts); return profile.fetchCommunityPosts(true)}).then(console.log); 
