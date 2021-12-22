import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { EntitySchemaFactory } from '../../database/entity-schema.factory';
import { StreamSchema } from './stream.schema';

import { GenericStream } from '../GenericStream';

@Injectable()
export class StreamSchemaFactory
    implements EntitySchemaFactory<StreamSchema, GenericStream>
{
    create(entity: GenericStream): StreamSchema {
        return {
            _id: new ObjectId(entity._id),
            streamId: entity.id,
            channelId: entity.channelId,
            title: entity.title,
            description: entity.description,
            platform: entity.platform,
            status: entity.status,
            startedAt: entity.startedAt,
            endedAt: entity.endedAt,
            scheduledFor: entity.scheduledFor,
        };
    }

    createFromSchema(schema: StreamSchema): GenericStream {
        return new GenericStream(
            schema._id.toHexString(),
            schema.streamId,
            schema.channelId,
            schema.platform,
            schema.title,
            schema.status,
            schema.startedAt,
            schema.description,
            schema.scheduledFor,
            schema.endedAt,
        );
    }
}
