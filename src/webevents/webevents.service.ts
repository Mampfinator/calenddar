import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from 'eventemitter2';
import { Stream } from '../streams/stream.read';
import { WebhooksService } from '../webhooks/webhooks.service';
import { WebsocketService } from '../websocket/websocket.service';
import { VTuberEntityRepository } from '../vtubers/db/vtuber-entity.repository';
@Injectable()
export class WebeventsService {
    private readonly logger = new Logger(WebeventsService.name);
    constructor(
        public readonly eventEmitter: EventEmitter2,
        private readonly websocketService: WebsocketService,
        private readonly webhooksService: WebhooksService,
        private readonly vtuberRepository: VTuberEntityRepository,
    ) {}

    async send(event: string, vtuberIds: string[], platform: string, payload: object) {
        const webevent = {
            event,
            vtubers: vtuberIds,
            platform,
            data: payload
        }

        this.websocketService.broadcast(webevent);
    }

    // event handlers are all central to the event service.
    // event handlers are structured webevents.[platform].[event].

    /* ---------------------------------------------- */
    /*                 YOUTUBE EVENTS                 */
    /* ---------------------------------------------- */
    @OnEvent("webevents.youtube.upload")
    async handleYouTubeUpload(video: Stream) {
        this.logger.debug(`Received youtube.upload webevent for ${video.id}`);

        const stream = {
            ...video, 
            status: "offline"
        };

        const vtubers = (await this.vtuberRepository.findByYoutubeId(stream.channelId)).map(v => v.getId());
        await this.send("upload", vtubers, "youtube", stream);
    }

    @OnEvent("webevents.youtube.upcoming")
    async handleYouTubeUpcoming(video: Stream) {
        this.logger.debug(`Received youtube.upcoming webevent for ${video.id}`);

        const stream = {
            ...video, 
            status: "upcoming"
        };

        const vtubers = (await this.vtuberRepository.findByYoutubeId(stream.channelId)).map(v => v.getId());
        await this.send("upcoming", vtubers, "youtube", stream);
    }

    @OnEvent("webevents.youtube.live") 
    async handleYouTubeLive(video: Stream) {
        this.logger.debug(`Received youtube.live webevent for ${video.id}`);

        const stream = {
            ...video, 
            status: "live"
        };

        const vtubers = (await this.vtuberRepository.findByYoutubeId(stream.channelId)).map(v => v.getId());
        await this.send("live", vtubers, "youtube", stream);
    }

    @OnEvent("webevents.youtube.offline")
    async handleYouTubeOffline(video: Stream) {
        const stream = {
            ...video, 
            status: "offline"
        };

        const vtubers = (await this.vtuberRepository.findByYoutubeId(stream.channelId)).map(v => v.getId());
        await this.send("offline", vtubers, "youtube", stream);
    }


    /* ---------------------------------------------- */
    /*                 TWITCH EVENTS                  */
    /* ---------------------------------------------- */
    @OnEvent("webevents.twitch.live")
    async handleTwitchLive(originalStream: Stream) {
        const stream = {
            ...originalStream,
            status: "live"
        }

        const vtubers = (await this.vtuberRepository.findByTwitchId(stream.channelId)).map(v => v.getId());
        await this.send("live", vtubers, "twitch", stream);
    }
    @OnEvent("webevents.twitch.offline")
    async handleTwitchOffline(originalStream: Stream) {
        const stream = {
            ...originalStream,
            status: "offline"
        }

        const vtubers = (await this.vtuberRepository.findByTwitchId(stream.channelId)).map(v => v.getId());
        await this.send("offline", vtubers, "twitch", stream);
    }
}
