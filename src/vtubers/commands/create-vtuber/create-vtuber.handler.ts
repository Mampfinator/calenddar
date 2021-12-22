import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { VTuberFactory } from '../../vtuber.factory';
import { CreateVTuberCommand } from './create-vtuber.command';

@CommandHandler(CreateVTuberCommand)
export class CreateVTuberHandler
    implements ICommandHandler<CreateVTuberCommand>
{
    constructor(
        private readonly vtuberFactory: VTuberFactory,
        private readonly eventPublisher: EventPublisher,
    ) {}

    async execute({ createVtuberRequest }: CreateVTuberCommand) {
        const { name, originalName, affiliation, youtubeId, twitchId } =
            createVtuberRequest;
        const vtuber = this.eventPublisher.mergeObjectContext(
            await this.vtuberFactory.create(
                name,
                originalName,
                affiliation,
                youtubeId,
                twitchId,
            ),
        );
        vtuber.commit();
    }
}
