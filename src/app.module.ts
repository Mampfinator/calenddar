import {
    Logger,
    MiddlewareConsumer,
    Module,
    NestModule,
    OnApplicationBootstrap,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VTubersModule } from './vtubers/vtubers.module';
import { YouTubeModule } from './youtube/youtube.module';
import { TwitchModule } from './twitch/twitch.module';
import { StreamsModule } from './streams/streams.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GraphQLModule } from '@nestjs/graphql';
import { videoStatusResolver } from './streams/stream.read';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config, { APIOptions, ThrottlerOptions } from './config/config';
import { AppController } from './app.controller';
import { RawBodyMiddleware } from './middleware/raw-body.middleware';
import { JSONBodyMiddleware } from './middleware/json-body.middleware';
import { WebeventsModule } from './webevents/webevents.module';
import { ThrottlerModule } from "@nestjs/throttler";
@Module({
    imports: [
        ConfigModule.forRoot({
            load: [config],
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI'),
            }),
            inject: [ConfigService],
        }),
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot({
            wildcard: true,
            delimiter: '.',
            newListener: false,
            removeListener: false,
            verboseMemoryLeak: true,
            ignoreErrors: false,
        }),
        GraphQLModule.forRoot({
            autoSchemaFile: true,
            resolvers: {
                VideoStatus: videoStatusResolver,
            },
        }),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => configService.get<ThrottlerOptions>("throttler")
        }),
        VTubersModule,
        YouTubeModule,
        TwitchModule,
        StreamsModule,
        WebeventsModule,
    ],
    providers: [AppService],
    controllers: [AppController],
})
export class AppModule implements NestModule, OnApplicationBootstrap {
    private readonly logger = new Logger(AppModule.name);
    constructor(
        private readonly configService: ConfigService
    ) {}
    
    public configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RawBodyMiddleware)
            .exclude('/graphql')
            .forRoutes('*')
            .apply(JSONBodyMiddleware)
            .exclude('/graphql')
            .forRoutes('*');
    }

    public onApplicationBootstrap() {
        const {host, port} = this.configService.get<APIOptions>("api");
        this.logger.log(`Successfully started. Listening on ${host}:${port}.`);
    }
}
