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
    Header,
} from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
    Stream,
    VideoStatus,
    StreamEntityRepository,
    StreamReadFactory,
    VTuberEntityRepository,
} from '../../core';
import { ValidateObjectIdPipe } from '../../common';
import { EventSub } from './eventsub/eventsub.decorator';
import { TwitchEventSubGuard } from './eventsub/eventsub.guard';
import { TwitchEventSubPayload } from './api/interfaces/TwitchEventSubPayload';
import { TwitchEventFactory } from './eventsub/twitch-event.factory';

@Controller({ path: 'twitch' })
export class TwitchController {
    private readonly logger = new Logger(TwitchController.name);

    constructor(
        private readonly streamRepository: StreamEntityRepository,
        private readonly streamReadFactory: StreamReadFactory,
        private readonly vtuberRepository: VTuberEntityRepository,
        private readonly eventBus: EventBus,
        private readonly eventFactory: TwitchEventFactory,
    ) {}

    @Get('live')
    async getLiveStreams(): Promise<Stream[]> {
        const streams = await this.streamRepository.findByQuery({
            platform: 'twitch',
            status: VideoStatus.Live,
        });
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
            status: VideoStatus.Live,
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

    @Post('eventsub')
    @HttpCode(200)
    @Header('Content-Type', 'text/plain')
    @UseGuards(TwitchEventSubGuard)
    async eventSub(@EventSub() notification: TwitchEventSubPayload<any>) {
        if (typeof notification === 'string') {
            return notification;
        }

        const event = this.eventFactory.create(notification);
        this.eventBus.publish(event);
    }
}
