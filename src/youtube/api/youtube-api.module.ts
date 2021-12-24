import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { YouTubeAPIService } from './youtube-api.service';

@Module({
    imports: [CqrsModule],
    providers: [YouTubeAPIService],
    exports: [YouTubeAPIService],
})
export class YouTubeAPIModule {}
