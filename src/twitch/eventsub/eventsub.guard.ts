import { BadRequestException, CanActivate, ExecutionContext, HttpException, Injectable, Logger } from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {TwitchEventSubService} from "./eventsub.service";
import { createHmac } from "crypto";
import { Request as ExpressRequest } from "express";
import { AddressInfo } from "net";
import ms from "ms";
import { Reflector } from "@nestjs/core";
import { TwitchEvent } from "./EventSub";

class NoContent extends HttpException {
    constructor() {
        super(`No Content`, 204);
    }
}

@Injectable()
export class TwitchEventSubGuard implements CanActivate {
    private readonly logger = new Logger(TwitchEventSubGuard.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly eventsubService: TwitchEventSubService,
        private readonly reflector: Reflector
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        this.logger.debug(`Got message from Twitch.`);

        const secret = this.configService.get<string>("TWITCH_WEBHOOK_SECRET");
        const req: ExpressRequest = context.switchToHttp().getRequest();
        
        const timestamp = req.header("Twitch-Eventsub-Message-Timestamp");
        const eventId = req.header("Twitch-Eventsub-Message-Id");
        const signature = req.header("Twitch-Eventsub-Message-Signature");
        const type = req.header("Twitch-Eventsub-Message-Type");

        // if the event is older than 10 minutes, ignore it.
        if (!timestamp || Date.now() - Date.parse(timestamp).valueOf() > ms("10m")) {
            const {address} = req.socket.address() as AddressInfo;
            this.logger.log(`Provided timestamp older than 10 minutes. Ignoring event ${eventId} from ${address}.`);
            throw new NoContent();
        }


        // if this event has already been seen, respond with a 204 as soon as possible.
        if (this.eventsubService.hasSeen(eventId)) {
            throw new NoContent();
        }

        // lastly, verify that the message is actually from Twitch.
        const [algorithm] = signature.split("=");
        const computedSignature = `${algorithm}=${createHmac("sha256", secret).update(eventId + timestamp + req["rawBody"]).digest("hex")}`;
        
        
        if (computedSignature !== signature) {
            this.logger.warn(`Computed non-match message signature:\nComputed: ${computedSignature}\nExpected: ${signature}`);
            throw new BadRequestException();
        }

        // Respond to challenge requests
        if (type == "webhook_callback_verification") {
            req["challenge"] = req.body.challenge;
            return true;
        }

        req["messageType"] = type;

        const eventType =  req.body.subscription.type;
        req["eventType"] = eventType;
        return true;
    }
}