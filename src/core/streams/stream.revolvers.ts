import { Resolver, Query, Args } from '@nestjs/graphql';
import { StreamReadRepository } from './db/stream-read.repository';
import { StreamReadFactory } from './db/stream-read.factory';
import { Stream, VideoStatusEnum } from './stream.read';

@Resolver(() => Stream)
export class StreamResolver {
    constructor(
        private readonly streamRepository: StreamReadRepository,
        private readonly streamReadFactory: StreamReadFactory
    ) {}


    @Query(() => [Stream])
    async streams(
        @Args("status", {type: () => VideoStatusEnum}) status: VideoStatusEnum
    ): Promise<Stream[]> {
        const streams = await this.streamRepository.findByStatus(status);
        return streams.map(stream => this.streamReadFactory.createFromRoot(stream));
    }
}
