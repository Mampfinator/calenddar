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
            youtubeId: id,
        });
    }

    async getAllYouTubeIds(): Promise<Set<string>> {
        const vtubers = await this.find({
            youtubeId: {$exists: true}
        });
        return new Set(vtubers.map(v => v.getYoutubeId()));
    }

    async findByTwitchId(id: string): Promise<VTuberRoot[]> {
        return this.find({
            twitchId: id,
        });
    }

    async getAllTwitchIds(): Promise<Set<string>> {
        const vtubers = await this.find({
            twitchId: {$exists: true}
        });
        return new Set(vtubers.map(v => v.getTwitchId()));
    }

    async findByTwittterId(id: string): Promise<VTuberRoot[]> {
        return this.find({
            twitterId: id,
        });
    }

    async getAllTwitterIds(): Promise<Set<string>> {
        const vtubers = await this.find({
            twitterId: {$exists: true}
        });
        return new Set(vtubers.map(v => v.getTwitterId()));
    }
}
