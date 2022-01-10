import { Injectable } from '@nestjs/common';
import {
    VideoStatus,
    StreamFactory,
    StreamEntityRepository,
    GenericStream,
} from '../../core';
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
            VideoStatus.Live,
        );
    }
}
