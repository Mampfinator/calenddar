export interface TwitchEventSubPayload<
    EventType,
    ConditionType = { broadcaster_user_id: string },
> {
    subscription: {
        id: string;
        type: string;
        version: '1';
        status: 'enabled' | 'disabled';
        cost: number;
        condition: ConditionType;
        created_at: string;
    };
    event: EventType;
}

export interface StreamLiveEventType {
    id: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    type: 'live' | '';
    started_at: string;
}

export interface StreamOfflineEventType {
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
}
