import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { VTuberReadRepository } from '../db/vtuber-read.repository';
import { VTuber } from '../vtuber.dto';
import { VTuberByIDQuery } from './vtuber-by-id.query';

@QueryHandler(VTuberByIDQuery)
export class VTuberByIDHandler implements IQueryHandler<VTuberByIDQuery> {
    constructor(private readonly vtuberReadRepository: VTuberReadRepository) {}

    async execute({ id }: VTuberByIDQuery): Promise<VTuber> {
        return this.vtuberReadRepository.findOneById(id);
    }
}
