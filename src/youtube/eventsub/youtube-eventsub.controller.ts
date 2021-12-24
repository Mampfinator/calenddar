import { 
    BadRequestException, 
    Body, 
    Controller, 
    ForbiddenException, 
    Get, 
    Headers, 
    HttpCode, 
    HttpException, 
    Post, 
    Query, 
    Logger 
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventBus } from "@nestjs/cqrs";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { createHmac } from "crypto";
import { XML } from "../../decorators/xml-body.decorator";
import { RawBody } from "../../decorators/raw-body.decorator";
import { YouTubeEventSubFeedEvent } from "./events/youtube-eventsub-feed.event.ts";

class InvalidSignatureException extends HttpException {
    constructor() {
        super(`Invalid signature.`, 202);
    }
}


@Controller("youtube")
export class YouTubeEventSubController {
    private readonly logger = new Logger(YouTubeEventSubController.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly eventEmitter: EventEmitter2,
        private readonly eventBus: EventBus
    ) {}

    @Get("eventsub")
    onGetRequest(
        @Query("hub.topic") topic: string, 
        @Query("hub.mode") mode: "denied" | "subscribe" | "unsubscribe", 
        @Query("hub") hub: string, 
        @Query("hub.challenge") challenge?: string, 
        @Query("hub.lease_seconds") lease?: string
    ) {
        const data = {
            topic,
            hub,
            lease: Number(lease)
        };
        
        if (!topic || !mode) throw new BadRequestException();

        // mainly for logging purposes & renewing leases.
        this.eventEmitter.emit(`youtube.eventsub.${mode}`, data);
        // return challenge to indicate we've received the request and want to receive notifications on the POST route.
        return challenge;
    }

    @Post("eventsub")
    @HttpCode(204)
    async onPostRequest(
        @Body() body,
        @RawBody() rawBody,
        @XML({
            customFields: {
                item: [
                    ["yt:videoId", "videoId"],
                    ["yt:channelId", "channelId"],
                    ["title"],
                    ["author"]
                ]
            }
        }) xmlBody,
        @Headers("x-hub-signature") hubSignature: string,
        @Headers("link") link
    ) {
        const secret = this.configService.get<string>("YOUTUBE_WEBHOOK_SECRET");

        if (!link) throw new BadRequestException();
        if (secret && !hubSignature) throw new ForbiddenException();

        // verify signature sent in message
        if (secret) {
            const [algo, signature] = hubSignature.split("=");
            const hmac = createHmac(algo, secret)
            let computedSignature: string;

            // hubSignature is a string like sha1=8ad0aid09a80da09sd8a...
            // If for some reason the first part of that string is not a valid encryption algorithm, crypto will throw an error (Invalid digest).
            // That also in turn means that something has gone wrong, and the message is most likely not from the hub.
            try {
                computedSignature = hmac.update(Buffer.from(rawBody, "utf-8")).digest("hex");
            } catch {
                throw new ForbiddenException();
            }
            if (computedSignature !== signature) throw new InvalidSignatureException(); // per spec, return 202 a non-matching signature was computed.
        }

        if (xmlBody && xmlBody.items?.length > 0 && xmlBody.items[0].videoId) this.eventBus.publish(new YouTubeEventSubFeedEvent(xmlBody.items[0]));
        else this.logger.debug(`Could not find items in YouTube PubSub XML Body: ${rawBody}`);
    }
}