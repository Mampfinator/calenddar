import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VTuber } from '../vtuber.dto';
import { VTuberSchema } from './vtuber.schema';
import { ObjectId } from 'mongodb';

@Injectable()
export class VTuberReadRepository {
    constructor(
        @InjectModel(VTuberSchema.name)
        private readonly vtuberModel: Model<VTuberSchema>,
    ) {}

    async findAll(): Promise<VTuber[]> {
        const vtubers = await this.vtuberModel.find({}, {}, { lean: true });

        return vtubers.map((v) => new VTuber(v));
    }

    async findOneById(id: string): Promise<VTuber> {
        const vtuber = await this.vtuberModel.findById(new ObjectId(id));
        return new VTuber(vtuber);
    }
}
