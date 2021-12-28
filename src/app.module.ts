import {
    Inject,
    Logger,
    LoggerService,
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
import { APP_GUARD } from '@nestjs/core';
import { ProtectedGuard } from './guards/protected-endpoint.guard';
import { WinstonModule, utilities as nestWinstonUtils, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {transports as winstonTransports, format} from "winston";
import "winston-mongodb"; 
import TransportStream from 'winston-transport';
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
        WinstonModule.forRootAsync({
            imports: [ConfigModule], 
            inject: [ConfigService], 
            useFactory: (configService: ConfigService) => {
                const mode = configService.get<string>("NODE_ENV");
                const transports: TransportStream[] = [
                    new winstonTransports.Console({
                        format: format.combine(
                            format.colorize(),
                            format.timestamp(),
                            format.ms(),
                            nestWinstonUtils.format.nestLike("Calenddar", {prettyPrint: true})
                        )
                    }),
                ];
                
                if (mode === "production") {
                    transports.push(
                        // @ts-ignore
                        new winstonTransports.MongoDB({
                            db: configService.get<string>("MONGODB_URI"),
                            level: "error",
                            options: {
                                useUnifiedTopology: true
                            },
                            collection: "logs",
                            handleExceptions: true,
                            handleRejections: true,
                            format: format.metadata()
                        })
                    );
                }

                return {
                    transports
                }
            }
        }),
        VTubersModule,
        YouTubeModule,
        TwitchModule,
        StreamsModule,
        WebeventsModule,
    ],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ProtectedGuard
        }
    ],
    controllers: [AppController],
})
export class AppModule implements NestModule, OnApplicationBootstrap {
    //private readonly logger = new Logger(AppModule.name);
    constructor(
        private readonly configService: ConfigService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
    ) {}
    
    public configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RawBodyMiddleware)
            .exclude('/graphql') // exclude graphql, not needed
            .forRoutes('*')
            .apply(JSONBodyMiddleware)
            .exclude('/graphql') // exclude graphql, messes with internal parsing
            .forRoutes('*');
    }

    public onApplicationBootstrap() {
        const {host, port} = this.configService.get<APIOptions>("api");
        this.logger.log(`Successfully started. Listening on ${host}:${port}.`);
    }
}