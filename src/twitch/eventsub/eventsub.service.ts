import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import ms from "ms";
import { TwitchAPIService } from "../api/twitch-api.service";
import { TwitchService } from "../twitch.service";

@Injectable()
export class TwitchEventSubService implements OnModuleInit {
    private readonly logger = new Logger(TwitchEventSubService.name);
    private readonly seenEvents = new Set<string>();
    // type = [userId, userId, userId, userId, ...]
    private readonly subscribedEvents: Map<string, Set<string>> = new Map();
    constructor(
        private readonly configService: ConfigService,
        private readonly twitchService: TwitchService,
        private readonly twitchApiService: TwitchAPIService
    ) {}

    public hasSeen(id: string): boolean {
        const hasSeen = this.seenEvents.has(id);
        if (!hasSeen) {
            this.seenEvents.add(id);
            setTimeout(() => {this.seenEvents.delete(id)}, ms("10m"));
        }

        return hasSeen;
    }

    async onModuleInit() {
        await this.twitchApiService.deleteAllSubscriptions();

        this.subscribedEvents.set("stream.online", new Set<string>());
        this.subscribedEvents.set("stream.offline", new Set<string>());


        const subscriptions = await this.twitchApiService.getSubscriptions();

        for (const subscription of subscriptions) {
            const {broadcaster_user_id} = subscription.condition;
            const {type} = subscription;
            this.subscribedEvents.get(type)?.add(broadcaster_user_id);
        }
    }

    async subscribe(userId: string) {
        const subscriptions = [];

        if (!this.subscribedEvents.get("stream.online")?.has(userId)) subscriptions.push(await this.twitchApiService.createSubscription("stream.online", userId));
        if (!this.subscribedEvents.get("stream.offline")?.has(userId)) subscriptions.push(await this.twitchApiService.createSubscription("stream.offline", userId));
        
        for (const subscription of subscriptions) {
            if (!subscription) continue;
            const {broadcaster_user_id} = subscription.condition;
            const {type} = subscription;

            this.subscribedEvents.get(type).add(broadcaster_user_id);
        }
    }

    async getUnconfirmedSubscriptions() {
        const subscriptions = await this.twitchApiService.getSubscriptions();
        return subscriptions.filter(v => v.status === "webhook_callback_verification_pending");
    }
}