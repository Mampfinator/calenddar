import { Args, Query, Resolver } from '@nestjs/graphql';
import { CommunityPost } from './communitypost.dto';
import { CommunityPostEntityRepository } from './db/communitypost-entity.repository';
import { CommunityPostReadRepository } from './db/communitypost-read.repository';

@Resolver(() => CommunityPost)
export class CommunityPostResolver {
    constructor(
        private readonly postReadRepository: CommunityPostReadRepository,
        private readonly postRepository: CommunityPostEntityRepository,
    ) {}

    @Query(() => CommunityPost, { nullable: true })
    async post(
        @Args('id', { type: () => String }) id: string,
    ): Promise<void | CommunityPost> {
        return (
            (await this.postReadRepository.findOneById(id).catch(() => {})) ??
            null
        );
    }

    @Query(() => [CommunityPost], { nullable: true })
    async posts(
        @Args('channelId', { type: () => String }) channelId: string,
    ): Promise<CommunityPost[]> {
        return (
            (await this.postReadRepository.findByChannelId(channelId)) ?? null
        );
    }
}
