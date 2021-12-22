import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VTubersModule } from './vtubers/vtubers.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { YouTubeModule } from './youtube/youtube.module';
import { TwitchModule } from './twitch/twitch.module';
import { StreamsModule } from './streams/streams.module';
import { WebsocketModule } from './websocket/websocket.module';
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
        WebhooksModule,
        YouTubeModule,
        TwitchModule,
        StreamsModule,
        WebsocketModule,
    ],
    providers: [ AppService ],
    controllers: [ AppController ]
})
export class AppModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer
        .apply(RawBodyMiddleware)
        .forRoutes("*")
        .apply(JSONBodyMiddleware)
        .forRoutes("*")
    }
}
