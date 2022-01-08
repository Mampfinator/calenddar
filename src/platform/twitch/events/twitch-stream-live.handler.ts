import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StreamEntityRepository } from '../../../core/streams/db/stream-entity.repository';
import { StreamFactory } from '../../../core/streams/stream.factory';
import { VideoStatusEnum } from '../../../core/streams/stream.read';
import { TwitchAPIService } from '../api/twitch-api.service';
import { TwitchStreamLiveEvent } from './twitch-stream-live.event';

@EventsHandler(TwitchStreamLiveEvent)
export class TwitchStreamLiveHandler
    implements IEventHandler<TwitchStreamLiveEvent>
{
    private readonly logger = new Logger(TwitchStreamLiveHandler.name);
    constructor(
        private readonly apiService: TwitchAPIService,
        private readonly streamRepository: StreamEntityRepository,
        private readonly streamFactory: StreamFactory,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async handle({ event }: TwitchStreamLiveEvent) {
        const { event: eventData } = event;
        const { id, broadcaster_user_id } = eventData;

        this.logger.log(
            `Handling TwitchStreamLiveEvent for ${broadcaster_user_id} (${id}).`,
        );

        const stream = await this.apiService.getStream(broadcaster_user_id);
        if (!(stream?.id === id)) return;
        if (await this.streamRepository.findByStreamId(id).catch()) return;

        const { title, started_at } = stream;

        const dbStream = await this.streamFactory.create(
            id,
            broadcaster_user_id,
            'twitch',
            title,
            VideoStatusEnum.Live,
            undefined,
            new Date(started_at),
        );

        this.eventEmitter.emit(`webevents.twitch.live`, dbStream);
    }
}
