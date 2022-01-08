import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StreamSchema } from './stream.schema';
import { ObjectId } from 'mongodb';
import { StreamSchemaFactory } from './stream-schema.factory';
import { GenericStream } from '../GenericStream';
import { VideoStatusEnum } from '../stream.read';

@Injectable()
export class StreamReadRepository {
    constructor(
        @InjectModel(StreamSchema.name)
        private readonly streamModel: Model<StreamSchema>,
        private readonly schemaFactory: StreamSchemaFactory,
    ) {}

    async findAll(): Promise<GenericStream[]> {
        const streams = await this.streamModel.find({}, {}, { lean: true });
        return streams.map((stream) =>
            this.schemaFactory.createFromSchema(stream),
        );
    }

    async findByInternalId(id: ObjectId);
    async findByInternalId(id: string);
    async findByInternalId(id: string | ObjectId): Promise<GenericStream> {
        if (typeof id === 'string') id = new ObjectId(id);
        const stream = await this.streamModel.findById(id);
        return this.schemaFactory.createFromSchema(stream);
    }

    async findByPublicId(id: string) {
        const stream = await this.streamModel.findOne({ streamId: id });
        return this.schemaFactory.createFromSchema(stream);
    }

    async findByPlatform(
        platform: 'youtube' | 'twitch',
    ): Promise<GenericStream[]> {
        const streams = this.streamModel.find({
            platform,
        }) as unknown as StreamSchema[];

        return streams.map((stream) =>
            this.schemaFactory.createFromSchema(stream),
        );
    }

    async findByStatus(status: VideoStatusEnum): Promise<GenericStream[]> {
        const streams = await this.streamModel.find({
            status,
        });
        return streams.map((stream) =>
            this.schemaFactory.createFromSchema(stream),
        );
    }
}
