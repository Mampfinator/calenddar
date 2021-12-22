import {
    Get,
    Controller,
    Param,
    NotFoundException,
    BadRequestException,
    Post,
    Logger,
    UseGuards,
    HttpCode,
    Header
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Stream, VideoStatusEnum } from '../streams/stream.read';
import { TwitchService } from './twitch.service';
import { StreamEntityRepository } from '../streams/db/stream-entity.repository';
import { StreamReadFactory } from '../streams/db/stream-read.factory';
import { VTuberEntityRepository } from '../vtubers/db/vtuber-entity.repository';
import { ValidateObjectIdPipe } from '../util';
import { EventSub } from './eventsub/eventsub.decorator';
import { TwitchEventNotificationBase } from './eventsub/TwitchEventNotifications';
import { TwitchEventSubGuard } from './eventsub/eventsub.guard';
import { EventBus } from '@nestjs/cqrs';
import { TwitchStreamLiveEvent } from './events/twitch-stream-live.event';
import { TwitchStreamOfflineEvent } from './events/twitch-stream-offline.event';

@Controller({ path: 'twitch' })
export class TwitchController {
    private readonly logger = new Logger(TwitchController.name);

    constructor(
        private readonly twitchService: TwitchService,
        private readonly adapterHost: HttpAdapterHost,
        private readonly streamRepository: StreamEntityRepository,
        private readonly streamReadFactory: StreamReadFactory,
        private readonly vtuberRepository: VTuberEntityRepository,
        private readonly eventBus: EventBus
    ) {}

    @Get('live')
    async getLiveStreams(): Promise<Stream[]> {
        const streams = (await this.streamRepository.findByQuery({
            platform: 'twitch',
            status: VideoStatusEnum.Live,
        }));
        return streams.map((v) => this.streamReadFactory.createFromRoot(v));
    }

    @Get(':vtuberId/live')
    async getVTuberLiveOnTwitch(
        @Param('vtuberId', ValidateObjectIdPipe) id: string,
    ): Promise<{ isLive: boolean; stream?: Stream }> {
        const vtuber = await this.vtuberRepository.findOneById(id);
        if (!vtuber)
            throw new NotFoundException(`Could not find VTuber with ID ${id}.`);
        if (!vtuber.getTwitchId())
            throw new BadRequestException(
                `VTuber with ID ${id} does not have a registered Twitch channel.`,
            );

        const stream = await this.streamRepository.findOneByQuery({
            channelId: vtuber.getTwitchId(),
            status: VideoStatusEnum.Live,
        });

        if (!stream) return { isLive: false };
        else
            return {
                isLive: true,
                stream: this.streamReadFactory.createFromRoot(stream),
            };
    }

    @Get(':vtuberId/channel')
    async getVTuberTwitchId(
        @Param('vtuberId', ValidateObjectIdPipe) id,
    ): Promise<{ channelId: string | null }> {
        const vtuber = await this.vtuberRepository.findOneById(id);
        return { channelId: vtuber.getTwitchId() ?? null };
    }

    @Post("eventsub")
    @HttpCode(200)
    @Header("Content-Type", "text/plain")
    @UseGuards(TwitchEventSubGuard)
    async eventSub<T extends TwitchEventNotificationBase>(@EventSub() notification: T) {
        if (typeof notification === "string") {
            this.logger.debug(`Sending back challenge ${notification}.`);
            return notification;
        }
        let event;
        switch (notification.type) {
            case "stream.online": 
                event = new TwitchStreamLiveEvent(notification);
                break;
            case "stream.offline": 
                event = new TwitchStreamOfflineEvent(notification); 
        }

        this.eventBus.publish(event);
        
    }
}
