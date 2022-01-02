import { Controller, Get, Param } from "@nestjs/common";
import { CommunityPostReadRepository } from "./db/communitypost-read.repository";

@Controller({path: "youtube"})
export class YouTubeCommunityPostsController {
    constructor(
        private readonly postReadRepository: CommunityPostReadRepository
    ) {}
    
    @Get("post/:id") 
    async fetchPostById(@Param("id") id: string) {
        return await this.postReadRepository.findOneById(id);
    }

    @Get("posts/:channelId")
    async fetchPostsByChannelId(@Param("channelId") channelId: string) {
        return await this.postReadRepository.findByChannelId(channelId);
    }
}