import { Injectable } from "@nestjs/common";
import { IEvent } from "@nestjs/cqrs";
import { TwitchEventSubPayload } from "../api/interfaces/TwitchEventSubPayload";
import { TwitchStreamLiveEvent } from "../events/twitch-stream-live.event";
import { TwitchStreamOfflineEvent } from "../events/twitch-stream-offline.event";

@Injectable()
export class TwitchEventFactory {
    create(body: TwitchEventSubPayload<any>): IEvent  {
        const { type } = body.subscription;
        switch (type) {
            case 'stream.online':
                return new TwitchStreamLiveEvent(body);
            case 'stream.offline':
                return new TwitchStreamOfflineEvent(body);
        }
    }
}
