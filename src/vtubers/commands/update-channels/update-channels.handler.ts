import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { VTuberEntityRepository } from '../../db/vtuber-entity.repository';
import { UpdateChannelsCommand } from './update-channels.command';

@CommandHandler(UpdateChannelsCommand)
export class UpdateChannelsHandler
    implements ICommandHandler<UpdateChannelsCommand>
{
    constructor(
        private readonly vtuberEntityRepository: VTuberEntityRepository,
        private readonly eventPublisher: EventPublisher,
    ) {}

    async execute({ updateChannelsRequest }: UpdateChannelsCommand) {
        const { id, youtubeId, twitchId } = updateChannelsRequest;
        const vtuber = await this.eventPublisher.mergeObjectContext(
            await this.vtuberEntityRepository.findOneById(id),
        );

        vtuber.setChannelId('youtube', youtubeId);
        vtuber.setChannelId('twitch', twitchId);

        await this.vtuberEntityRepository.findOneAndReplaceById(id, vtuber);

        vtuber.commit();
    }
}
