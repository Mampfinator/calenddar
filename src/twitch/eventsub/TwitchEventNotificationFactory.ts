import { StreamOnlineEventNotification, StreamOfflineEventNotification, TwitchEventNotificationBase } from "./TwitchEventNotifications";

export class TwitchEventNotificationFactory {
    static create(body: {[key: string]: any}): TwitchEventNotificationBase {
        const { type } = body.subscription;
        switch(type) {
            case "stream.online": return new StreamOnlineEventNotification(body);
            case "stream.offline": return new StreamOfflineEventNotification(body);
        }
    }
}