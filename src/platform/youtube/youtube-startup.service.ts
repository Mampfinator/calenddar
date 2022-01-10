import { Injectable } from '@nestjs/common';
import { IStartupService } from '../platform-module.interface';
import { YouTubeAPIService } from './api/youtube-api.service';
import { YouTubeEventSubService } from './eventsub/youtube-eventsub.service';
import { YouTubeService } from './youtube.service';
@Injectable()
export class YouTubeStartupService implements IStartupService {
    constructor(
        private readonly mainService: YouTubeService,
        private readonly eventsubService: YouTubeEventSubService,
        private readonly apiService: YouTubeAPIService,
    ) {}

    init() {}
}
