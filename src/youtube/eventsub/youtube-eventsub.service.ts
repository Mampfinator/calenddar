import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventBus } from "@nestjs/cqrs";
import { APIOptions } from "../../config/config";
import { OnEvent } from "@nestjs/event-emitter";
import axios, { AxiosRequestConfig } from "axios";
import { buildRequest } from "../../util";

interface IPubSubHubbubMessage {
    topic: string;
    hub?: string;
    callback: string;
    feed: Buffer;
    headers: Record<string, string>;
}

interface IPubSubHubbubSubscribeMessage extends IPubSubHubbubMessage {
    lease: number;
}

@Injectable()
export class YouTubeEventSubService {
    private readonly subscriptionTimers: Map<string, ReturnType<typeof setTimeout>> = new Map(); 
    private readonly logger = new Logger(YouTubeEventSubService.name);

    protected readonly _callbackUrl;
    protected readonly hub = `https://pubsubhubbub.appspot.com/`;

    constructor(
        private readonly configService: ConfigService,
        private readonly eventBus: EventBus
    ) {
        this._callbackUrl = `https://${this.configService.get<APIOptions>("api").host}/youtube/eventsub`;
    }

    private _buildSubscriptionRequest(mode: "subscribe" | "unsubscribe", id: string): AxiosRequestConfig {
        const secret = this.configService.get<string>("YOUTUBE_WEBHOOK_SECRET");
        const topic = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${id}`;
        return {
            method: "POST",
            baseURL: this.hub,
            params: {
                "hub.callback":  buildRequest(this._callbackUrl, {topic, hub: this.hub}),
                "hub.mode": "subscribe",
                "hub.topic": topic,
                "hub.verify": "async"
            }
        }
    }

    async subscribe(id: string) {
        const response = await axios(this._buildSubscriptionRequest("subscribe", id));
        if (response.status !== 202 && response.status !== 204) throw new Error(`Received status code ${response.status} (${response.statusText}) back from PubSubHubbub hub.`);
    }

    async unsubscribe(id: string) {
        const response = await axios(this._buildSubscriptionRequest("unsubscribe", id));
        if (response.status !== 202 && response.status !== 204) throw new Error(`Unexpected status ${response.status} (${response.statusText})`); 
    }

    @OnEvent("youtube.eventsub.subscribe")
    private onSubscribe(data: IPubSubHubbubSubscribeMessage) {
        const [ ,id] = data.topic.split("=");
        const {lease} = data;

        this.logger.debug(`Got subscribe event for: ${id}`);

        this.subscriptionTimers.set(id, setTimeout(() => {
            //this.subscribe(id);
        }, Math.max(lease - 10000, 10000)))
    }

    @OnEvent("youtube.eventsub.unsubscribe")
    private onUnsubscribe(data: IPubSubHubbubMessage) {
        const [ ,id] = data.topic.split("=");
        this.logger.debug(`Got unsubscribe event for: ${id}`);

        clearTimeout(this.subscriptionTimers.get(id));
        this.subscriptionTimers.delete(id);
    }
}