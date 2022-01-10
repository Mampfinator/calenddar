import {
    Controller,
    Get,
    Logger,
    NotFoundException,
    Param,
} from '@nestjs/common';
import { ValidateObjectIdPipe } from '../../common';
import { VTuberEntityRepository } from '../../core';
import { YouTubeEventSubService } from './eventsub/youtube-eventsub.service';

@Controller('youtube')
export class YouTubeController {
    private readonly logger = new Logger(YouTubeController.name);
    constructor(
        private readonly vtuberRepository: VTuberEntityRepository,
        private readonly eventsubService: YouTubeEventSubService,
    ) {}

    @Get(':vtuberId/channel')
    async getVtuberChannel(
        @Param('vtuberId', ValidateObjectIdPipe) id: string,
    ) {
        const vtuber = await this.vtuberRepository.findOneById(id);
        if (!vtuber)
            throw new NotFoundException(`Could not find VTuber with ID ${id}.`);

        return {};
    }
}
