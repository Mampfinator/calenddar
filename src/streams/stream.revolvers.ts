import { Resolver, Query } from '@nestjs/graphql';
import { Stream, VideoStatusEnum } from './stream.read';

const streams = [
    new Stream(
        'test',
        'not a valid youtube channel',
        'not youtube',
        'not a stream',
        VideoStatusEnum.Live,
    ),
];

@Resolver(() => Stream)
export class StreamResolver {
    @Query(() => [Stream])
    async streams(): Promise<Stream[]> {
        return streams;
    }
}
