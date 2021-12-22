import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseEntityRepository } from '../../database/base-entity.repository';
import { GenericStream } from '../GenericStream';
import { StreamSchemaFactory } from './stream-schema.factory';
import { StreamSchema } from './stream.schema';
import { Model } from 'mongoose';

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
}
