import { TwitchStreamLiveHandler } from './twitch-stream-live.handler';
import { TwitchStreamOfflineHandler } from './twitch-stream-offline.handler';

export const TwitchEventHandlers = [
    TwitchStreamLiveHandler,
    TwitchStreamOfflineHandler,
];
