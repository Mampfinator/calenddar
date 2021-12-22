import { Controller, Get, Logger, Next, NotFoundException, Param, Post, Req, Res } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { ValidateObjectIdPipe } from "../util";
import { VTuberEntityRepository } from "../vtubers/db/vtuber-entity.repository";
import { YouTubeEventSubService } from "./eventsub/youtube-eventsub.service";

@Controller("youtube")
export class YouTubeController {
    private readonly logger = new Logger(YouTubeController.name);
    constructor(
        private readonly vtuberRepository: VTuberEntityRepository,
        private readonly eventsubService: YouTubeEventSubService,
    ) {}

    @Get(":vtuberId/channel")
    async getVtuberChannel(@Param("vtuberId", ValidateObjectIdPipe) id: string) {
        const vtuber = await this.vtuberRepository.findOneById(id);
        if (!vtuber) throw new NotFoundException(`Could not find VTuber with ID ${id}.`);

        return {}
    }
}