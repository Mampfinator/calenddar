import { Injectable } from '@nestjs/common';
import { StreamEntityRepository } from '../../core/streams/db/stream-entity.repository';
import { GenericStream } from '../../core/streams/GenericStream';
import { StreamFactory } from '../../core/streams/stream.factory';
import { VideoStatusEnum } from '../../core/streams/stream.read';
import { HelixStream } from './api/interfaces/HelixStream';

@Injectable()
export class TwitchStreamFactory {
    constructor(
        private readonly streamFactory: StreamFactory,
        private readonly streamRepository: StreamEntityRepository,
    ) {}
    async createFromHelixStream(
        helixStream: HelixStream,
    ): Promise<GenericStream> {
        return await this.streamFactory.create(
            helixStream.id,
            helixStream.user_id,
            'twitch',
            helixStream.title,
            VideoStatusEnum.Live,
        );
    }
}
