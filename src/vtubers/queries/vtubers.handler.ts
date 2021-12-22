import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { VTuberReadRepository } from '../db/vtuber-read.repository';
import { VTuber } from '../vtuber.dto';
import { VTubersQuery } from './vtubers.query';

@QueryHandler(VTubersQuery)
export class VTubersHandler implements IQueryHandler<VTubersQuery> {
    constructor(private readonly vtuberReadRepository: VTuberReadRepository) {}

    async execute(): Promise<VTuber[]> {
        return this.vtuberReadRepository.findAll();
    }
}
