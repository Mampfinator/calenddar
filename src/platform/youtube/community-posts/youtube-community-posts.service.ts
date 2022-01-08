import { HttpException, Injectable, Logger } from "@nestjs/common";
import { CommunityPostFactory } from "./communitypost.factory";
import { CommunityPostEntityRepository } from "./db/communitypost-entity.repository";
import { YouTubeScraper } from "./scraping/YouTubeScraper";

@Injectable()
export class YouTubeCommunityPostsService {
    private readonly scraper = new YouTubeScraper();
    private _hasFetchedInitial = false;
    private readonly logger = new Logger(YouTubeCommunityPostsService.name);

    constructor(
        private readonly postRepository: CommunityPostEntityRepository,
        private readonly postFactory: CommunityPostFactory
    ) {}

    async syncPostsById(id: string) {
        const posts = await this.scraper.fetchPosts(id);
        for (const [id, post] of posts) {
            if (!(await this.postRepository.findOneByPublicId(id).catch((error: HttpException) => {if (error.getStatus() !== 404) throw error}))) {
                this.logger.log(`Found new post with ID ${id}`); 
                await this.postFactory.create(
                    post.id,
                    post.channelId,
                    post.text,
                    post.attachment
                );
            }
        }
    }

    hasFetchedInitial() {
        return this._hasFetchedInitial;
    }

    finishedFetching() {
        this._hasFetchedInitial = true;
    }
}