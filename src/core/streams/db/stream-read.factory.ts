import { Stream } from '../stream.read';
import { Injectable } from '@nestjs/common';
import { StreamSchema } from './stream.schema';
import { GenericStream } from '../GenericStream';

@Injectable()
export class StreamReadFactory {
    createFromSchema(videoSchema: StreamSchema): Stream {
        const {
            streamId,
            channelId,
            title,
            platform,
            status,

            // YouTube fields
            description,
            startedAt,
            endedAt,
            scheduledFor,
        } = videoSchema;

        return new Stream(
            streamId,
            channelId,
            platform,
            title,
            status,
            description,
            startedAt,
            endedAt,
            scheduledFor,
        );
    }

    createFromRoot(root: GenericStream): Stream {
        const {
            id,
            title,
            channelId,
            platform,
            status,
            description,
            startedAt,
            endedAt,
            scheduledFor,
        } = root;

        return new Stream(
            id,
            channelId,
            platform,
            title,
            status,
            description,
            startedAt,
            endedAt,
            scheduledFor,
        );
    }
}
