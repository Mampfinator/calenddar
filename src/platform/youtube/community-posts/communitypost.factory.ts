import { Injectable } from '@nestjs/common';
import { EntityFactory } from '../../../core/database/entity.factory';
import { CommunityPostRoot } from './CommunityPost';
import { CommunityPostAttachment } from './scraping/YouTubeScraper';
import { ObjectId } from 'mongodb';
import { CommunityPostCreatedEvent } from './events/communitypost-created.event';
import { CommunityPostEntityRepository } from './db/communitypost-entity.repository';

@Injectable()
export class CommunityPostFactory implements EntityFactory<CommunityPostRoot> {
    constructor(
        private readonly postEntityRepository: CommunityPostEntityRepository,
    ) {}

    async create(
        id: string,
        channelId: string,
        text: string,
        attachment?: CommunityPostAttachment,
    ): Promise<CommunityPostRoot> {
        const post = new CommunityPostRoot(
            new ObjectId().toHexString(),
            id,
            channelId,
            text,
            attachment,
        );

        await this.postEntityRepository.create(post);
        post.apply(new CommunityPostCreatedEvent(post));
        return post;
    }
}
