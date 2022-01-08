import { Module } from '@nestjs/common';
import { TwitcastingAPIModule } from '../api/twitcasting-api.module';
import { TwitcastingEventsubService } from './twitcasting-eventsub.service';
import { TwitcastingEventsubController } from './twitcasting-eventsub.controller';

@Module({
    imports: [TwitcastingAPIModule],
    providers: [TwitcastingEventsubService],
    controllers: [TwitcastingEventsubController],
})
export class TwitcastingEventsubModule {}
