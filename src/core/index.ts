// TODO: finish for easier imports from platform/

// modules
export { VTubersModule } from './vtubers/vtubers.module';
export { WebeventsModule } from './webevents/webevents.module';

// repositories
export { VTuberReadRepository } from './vtubers/db/vtuber-read.repository';
export { VTuberEntityRepository } from './vtubers/db/vtuber-entity.repository';

// factories
export { VTuberSchemaFactory } from './vtubers/db/vtuber-schema.factory';
export { VTuberFactory } from './vtubers/vtuber.factory';

// misc services
export { WebeventsService } from './webevents/webevents.service';

// roots
export { VTuberRoot } from './vtubers/VTuber';

// read classes
export { VTuber } from './vtubers/vtuber.dto';

// miscellaneous
export { VideoStatusEnum as VideoStatus } from './streams/stream.read';

// interfaces
export {
    APIOptions,
    YouTubeOptions,
    ThrottlerOptions,
    GraphQLOptions,
} from './config/config';

export {
    StreamsModule,
    StreamReadFactory,
    StreamReadRepository,
    StreamFactory,
    StreamSchemaFactory,
    Stream,
    GenericStream,
    StreamEntityRepository,
} from './streams/index';
