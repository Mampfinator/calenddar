import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { EntityFactory } from '../database/entity.factory';
import { VTuberRoot } from './VTuber';
import { VTuberEntityRepository } from './db/vtuber-entity.repository';
import { VTuberCreatedEvent } from './events/vtuber-created.event';

@Injectable()
export class VTuberFactory implements EntityFactory<VTuberRoot> {
    constructor(
        private readonly vtuberEntityRepository: VTuberEntityRepository,
    ) {}

    async create(
        name: string,
        originalName: string | null,
        affiliation,
        youtubeId: string | null,
        twitchId: string | null,
        twitterId: string | null,
        twitcastingId: string | null
    ): Promise<VTuberRoot> {
        const vtuber = new VTuberRoot(
            new ObjectId().toHexString(),
            name,
            originalName,
            affiliation,
            youtubeId,
            twitchId,
            twitterId,
            twitcastingId
        );
        await this.vtuberEntityRepository.create(vtuber);
        vtuber.apply(new VTuberCreatedEvent(vtuber.getId()));
        return vtuber;
    }
}
