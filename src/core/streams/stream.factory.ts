import { Injectable } from '@nestjs/common';
import { StreamEntityRepository } from './db/stream-entity.repository';
import { GenericStream } from './GenericStream';
import { VideoStatusEnum } from './stream.read';
import { ObjectId } from 'mongodb';

@Injectable()
export class StreamFactory {
    constructor(
        private readonly streamEntityRepository: StreamEntityRepository,
    ) {}

    async create(
        id: string,
        channelId: string,
        platform: string,
        title: string,
        status: VideoStatusEnum,

        description?: string,
        startedAt?: Date,
        endedAt?: Date,
        scheduledFor?: Date,
    ): Promise<GenericStream> {
        const _id = new ObjectId().toHexString();
        const stream = new GenericStream(
            _id,
            id,
            channelId,
            platform,
            title,
            status,
            startedAt,
            description,
            endedAt,
            scheduledFor,
        );

        await this.streamEntityRepository.create(stream);
        return stream;
    }
}
