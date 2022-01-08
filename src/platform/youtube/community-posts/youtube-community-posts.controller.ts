import { CacheInterceptor, CacheTTL, Controller, Get, Logger, NotFoundException, Param, Post, UseInterceptors} from "@nestjs/common";
import { Protected } from "../../../common/decorators/protected-endpoint.decorator";
import { CommunityPostReadRepository } from "./db/communitypost-read.repository";
import { YouTubeScraper } from "./scraping/YouTubeScraper";

@Controller({path: "youtube"})
export class YouTubeCommunityPostsController {
    private readonly scraper = new YouTubeScraper();
    private readonly logger = new Logger(YouTubeCommunityPostsController.name);
    constructor(
        private readonly postReadRepository: CommunityPostReadRepository,
    ) {

    }
    
    // private endpoint that's used by a different service to make nice-ish YouTube embeds for Discord.
    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300000)
    @Protected()
    @Post("post/:id")
    async fetchPostById(@Param("id") id: string) {
        this.logger.log(`Got post fetch request for: ${id}`);

        const post = await this.scraper.fetchPost(id).catch(e => {
            this.logger.error(e);
            throw new NotFoundException(`Could not find post with ID ${id}!`);
        });

        return post;
    }

    @Get("post/:id") 
    async getPostById(@Param("id") id: string) {
        return await this.postReadRepository.findOneById(id);
    }

    @Get("posts/:channelId")
    async fetchPostsByChannelId(@Param("channelId") channelId: string) {
        return await this.postReadRepository.findByChannelId(channelId);
    }
}
