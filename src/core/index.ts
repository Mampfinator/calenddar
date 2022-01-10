// TODO: finish for easier imports from platform/

// modules
export { VTubersModule } from './vtubers/vtubers.module';
export { StreamsModule } from './streams/streams.module';
export { WebeventsModule } from './webevents/webevents.module';

// repositories
export { StreamReadRepository } from './streams/db/stream-read.repository';
export { StreamEntityRepository } from './streams/db/stream-entity.repository';
export { VTuberReadRepository } from './vtubers/db/vtuber-read.repository';
export { VTuberEntityRepository } from './vtubers/db/vtuber-entity.repository';

// factories
export { StreamFactory } from './streams/stream.factory';
export { StreamReadFactory } from './streams/db/stream-read.factory';
export { StreamSchemaFactory } from './streams/db/stream-schema.factory';
export { VTuberSchemaFactory } from './vtubers/db/vtuber-schema.factory';
export { VTuberFactory } from './vtubers/vtuber.factory';

// misc services
export { WebeventsService } from './webevents/webevents.service';

// roots
export { VTuberRoot } from './vtubers/VTuber';
export { GenericStream } from './streams/GenericStream';

// read classes
export { VTuber } from './vtubers/vtuber.dto';
export { Stream } from './streams/stream.read';

// miscellaneous
export { VideoStatusEnum as VideoStatus } from './streams/stream.read';

// interfaces
export {
    APIOptions,
    YouTubeOptions,
    ThrottlerOptions,
    GraphQLOptions,
} from './config/config';
