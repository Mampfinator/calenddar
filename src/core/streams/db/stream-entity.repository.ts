import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseEntityRepository } from '../../database';
import { GenericStream } from '../GenericStream';
import { StreamSchemaFactory } from './stream-schema.factory';
import { StreamSchema } from './stream.schema';
import { VideoStatusEnum } from '../stream.read';

@Injectable()
export class StreamEntityRepository extends BaseEntityRepository<
    StreamSchema,
    GenericStream
> {
    constructor(
        @InjectModel(StreamSchema.name) streamModel: Model<StreamSchema>,
        streamSchemaFactory: StreamSchemaFactory,
    ) {
        super(streamModel, streamSchemaFactory);
    }

    async findByStreamId(streamId: string) {
        return this.findOne({ streamId }).catch(() => {
            /**/
        });
    }

    async findByStatus(status: VideoStatusEnum, platform?: string) {
        return this.find({ status, platform });
    }

    async findNonOffline(platform?: string) {
        const live = await this.findByStatus(VideoStatusEnum.Live, platform);
        const upcoming = await this.findByStatus(
            VideoStatusEnum.Upcoming,
            platform,
        );
        return live.concat(upcoming);
    }
}
