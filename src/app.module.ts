import { 
    MiddlewareConsumer, 
    Module, 
    NestModule, 
    OnApplicationBootstrap
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
import config from './config/config';
import { AppController } from './app.controller';
import { RawBodyMiddleware } from './middleware/raw-body.middleware';
import { JSONBodyMiddleware } from './middleware/json-body.middleware';
import { WebeventsModule } from './webevents/webevents.module';
import { startAllTimers } from './decorators/dynamic-timer.decorator';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [config],
            isGlobal: true
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>("MONGODB_URI")
            }),
            inject: [ConfigService]
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
        VTubersModule,
        YouTubeModule,
        TwitchModule,
        StreamsModule,
        WebeventsModule
    ],
    providers: [ AppService ],
    controllers: [ AppController ]
})
export class AppModule implements NestModule, OnApplicationBootstrap {
    public configure(consumer: MiddlewareConsumer) {
        consumer
        .apply(RawBodyMiddleware)
        .exclude("/graphql")
        .forRoutes("*")
        .apply(JSONBodyMiddleware)
        .exclude("/graphql")
        .forRoutes("*")
    }

    async onApplicationBootstrap() {
        await startAllTimers();
    }
}