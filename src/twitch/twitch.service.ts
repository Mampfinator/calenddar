import { Injectable, Logger } from '@nestjs/common';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpAdapterHost } from '@nestjs/core';
import { EventBus } from '@nestjs/cqrs';

import { StreamEntityRepository } from '../streams/db/stream-entity.repository';
import { VTuberEntityRepository } from '../vtubers/db/vtuber-entity.repository';

import { TwitchStreamFactory } from './twitch-stream.factory';
import { ConfigService } from '@nestjs/config';
import { TwitchAPIService } from './api/twitch-api.service';
import { VideoStatusEnum } from '../streams/stream.read';

@Injectable()
export class TwitchService {
    private readonly logger = new Logger(TwitchService.name);

    constructor(
        private readonly streamRepository: StreamEntityRepository,
        private readonly twitchStreamFactory: TwitchStreamFactory,
        private readonly adapterHost: HttpAdapterHost,
        private readonly vtuberRepository: VTuberEntityRepository,
        private readonly eventBus: EventBus,
        private readonly eventEmitter: EventEmitter2,
        private readonly configService: ConfigService,
        private readonly twitchApiService: TwitchAPIService
    ) {
    }

    async getAllUserIds(): Promise<string[]> {
        const vtubers = await this.vtuberRepository.findByQuery({
            twitchId: { $exists: true },
        });
        return vtubers.map((v) => v.getTwitchId());
    }

    async syncUserState(userId: string): Promise<void> {
        const isLive = await this.twitchApiService.getStream(userId);
        if (!isLive) {
            const currentLiveStreams = await this.streamRepository.findByQuery({status: VideoStatusEnum.Live, platform: "twitch", channelId: userId}).catch(() => {/**/});
            if (!currentLiveStreams) return; 
            for (const liveStream of currentLiveStreams) {
                // no stream online, meaning that, if there are streams currently marked as online, we can set them to offline instead.
                liveStream.status = VideoStatusEnum.Offline;
                await this.streamRepository.findOneAndReplaceById(liveStream._id, liveStream);
            }
        } else {
            if (!await this.streamRepository.findOneByQuery({streamId: isLive.id}).catch(() => {/* ignore not found */})) {
                await this.twitchStreamFactory.createFromHelixStream(isLive);
            }
        }
    }
}
