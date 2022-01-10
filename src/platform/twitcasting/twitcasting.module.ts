import { Module } from '@nestjs/common';
import { TwitcastingService } from './twitcasting.service';
import { TwitcastingAPIModule } from './api/twitcasting-api.module';
import { StreamsModule } from '../../core';

@Module({
    imports: [TwitcastingAPIModule, StreamsModule],
    providers: [TwitcastingService],
    exports: [TwitcastingService],
})
export class TwitcastingModule {}
