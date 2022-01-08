import { HttpException, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StreamEntityRepository } from '../../../core/streams/db/stream-entity.repository';
import { VideoStatusEnum } from '../../../core/streams/stream.read';
import { TwitchStreamOfflineEvent } from './twitch-stream-offline.event';

@EventsHandler(TwitchStreamOfflineEvent)
export class TwitchStreamOfflineHandler
    implements IEventHandler<TwitchStreamOfflineEvent>
{
    private readonly logger = new Logger(TwitchStreamOfflineHandler.name);
    constructor(
        private readonly streamRepository: StreamEntityRepository,
        private readonly eventEmitter: EventEmitter2
    ) {}

    async handle({event}: TwitchStreamOfflineEvent) {
        const {event: eventData} = event;
        const {broadcaster_user_id} = eventData;

        this.logger.log(`Handling TwitchStreamLiveEvent for ${broadcaster_user_id}.`);

        const stream = await this.streamRepository.findOneByQuery({
            channelId: broadcaster_user_id,
            status: VideoStatusEnum.Live
        })
        .catch(error => {
            if (error instanceof HttpException) this.logger.error(error);
        });

        if (!stream) return;

        stream.status = VideoStatusEnum.Offline;

        await this.streamRepository.findOneAndReplaceById(stream._id, stream);
        this.eventEmitter.emit("webevents.twitch.offline", stream);
    }
}
