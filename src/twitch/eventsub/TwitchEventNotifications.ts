export class TwitchEventNotificationBase {
    id: string;
    type: string; 
    status: boolean;
    constructor(body: {[key: string]: any}) {
        this.type = body.subscription.type;
    }
}


export class StreamOnlineEventNotification extends TwitchEventNotificationBase {
    public streamId: string;
    public userId: string;
    public type: string;
    public startedAt: Date;
    constructor(body: {[key: string]: any}) {
        super(body);

        const {event} = body;
        this.streamId = event.id;
        this.userId = event.broadcaster_user_id;
        this.type = event.type;
        this.startedAt = new Date(event.started_at);

    }
}

export class StreamOfflineEventNotification extends TwitchEventNotificationBase {
    public userId;
    constructor(body: {[key: string]: any}) {
        super(body);

        const {event} = body;
        this.userId = event.broadcaster_user_id;
    }
}