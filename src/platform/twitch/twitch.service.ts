import { Injectable, Logger } from '@nestjs/common';
import {
    StreamEntityRepository,
    VTuberEntityRepository,
    VideoStatus,
} from '../../core';
import { TwitchStreamFactory } from './twitch-stream.factory';
import { TwitchAPIService } from './api/twitch-api.service';

@Injectable()
export class TwitchService {
    private readonly logger = new Logger(TwitchService.name);

    constructor(
        private readonly streamRepository: StreamEntityRepository,
        private readonly twitchStreamFactory: TwitchStreamFactory,
        private readonly vtuberRepository: VTuberEntityRepository,
        private readonly twitchApiService: TwitchAPIService,
    ) {}

    async getAllUserIds(): Promise<string[]> {
        const vtubers = await this.vtuberRepository.findByQuery({
            twitchId: { $exists: true },
        });
        return vtubers.map((v) => v.getTwitchId());
    }

    async syncUserState(userId: string): Promise<void> {
        const channel = await this.twitchApiService.getChannelInformation(
            userId,
        );
        if (channel.game_id === undefined) {
            const currentLiveStreams = await this.streamRepository
                .findByQuery({
                    status: VideoStatus.Live,
                    platform: 'twitch',
                    channelId: userId,
                })
                .catch(() => {
                    /**/
                });
            if (!currentLiveStreams) {
                return;
            }
            for (const liveStream of currentLiveStreams) {
                // no stream online, meaning that, if there are streams currently marked as online, we can set them to offline instead.
                liveStream.status = VideoStatus.Offline;
                await this.streamRepository.findOneAndReplaceById(
                    liveStream._id,
                    liveStream,
                );
            }
        } else {
            const stream = await this.twitchApiService.getStream(userId);
            if (
                stream &&
                !(await this.streamRepository
                    .findOneByQuery({ streamId: stream.id })
                    .catch(() => {
                        /* ignore not found */
                    }))
            ) {
                await this.twitchStreamFactory.createFromHelixStream(stream);
            }
        }
    }
}
