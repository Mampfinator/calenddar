import { Injectable, Logger } from '@nestjs/common';
import { TwitchService } from '../twitch/twitch.service';
import { YouTubeService } from '../youtube/youtube.service';

@Injectable()
export class StreamsService {
    private readonly logger = new Logger(StreamsService.name);

    constructor(
        public readonly twitchService: TwitchService,
        public readonly youtubeService: YouTubeService,
    ) {}
}
