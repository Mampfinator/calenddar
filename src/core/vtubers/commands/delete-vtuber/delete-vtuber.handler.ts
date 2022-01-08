import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { VTuberEntityRepository } from '../../db/vtuber-entity.repository';
import { DeleteVTuberCommand } from './delete-vtuber.command';

@CommandHandler(DeleteVTuberCommand)
export class DeleteVTuberHandler
    implements ICommandHandler<DeleteVTuberCommand>
{
    constructor(
        private readonly eventPublisher: EventPublisher,
        private readonly vtuberEntityRepository: VTuberEntityRepository,
    ) {}

    async execute({ id }: DeleteVTuberCommand) {
        await this.vtuberEntityRepository.deleteOneById(id);
    }
}
