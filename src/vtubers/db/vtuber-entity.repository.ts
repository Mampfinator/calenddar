import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseEntityRepository } from '../../database/base-entity.repository';
import { VTuberRoot } from '../VTuber';
import { VTuberSchema } from './vtuber.schema';
import { VTuberSchemaFactory } from './vtuber-schema.factory';

@Injectable()
export class VTuberEntityRepository extends BaseEntityRepository<
    VTuberSchema,
    VTuberRoot
> {
    constructor(
        @InjectModel(VTuberSchema.name) vtuberModel: Model<VTuberSchema>,
        vtuberSchemaFactory: VTuberSchemaFactory,
    ) {
        super(vtuberModel, vtuberSchemaFactory);
    }

    async findByYoutubeId(id: string): Promise<VTuberRoot[]> {
        return this.find({
            youtubeId: id
        });
    }

    async findByTwitchId(id: string): Promise<VTuberRoot[]> {
        return this.find({
            twitchId: id
        });
    }
}
