import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    Channels,
    EventSubSubscriptions,
    SearchChannels,
    Streams,
    TwitchOAuth2URL,
} from './constants';
import { TwitchRequestBuilder } from './TwitchRequestBuilder';
import { APIOptions } from '../../config/config';

interface AccessTokenGrant {
    access_token: string;
    refresh_token: string;
    expires_in: string;
}

@Injectable()
export class TwitchAPIService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(TwitchAPIService.name);

    private readonly secret: string;
    private readonly clientId: string;

    private accessToken: string;
    private _refreshInterval: ReturnType<typeof setInterval>;

    constructor(private readonly configService: ConfigService) {
        this.secret = this.configService.get<string>(
            'TWITCH_API_CLIENT_SECRET',
        );
        this.clientId = this.configService.get<string>('TWITCH_API_CLIENT_ID');
    }

    async onModuleInit() {
        const generateToken = async () => {
            const { access_token }: AccessTokenGrant =
                await new TwitchRequestBuilder()
                    .setUrl(TwitchOAuth2URL)
                    .setMethod('POST')
                    .setParameter('client_id', this.clientId)
                    .setParameter('client_secret', this.secret)
                    .setParameter('grant_type', 'client_credentials')
                    .send();
            this.accessToken = access_token;

            this.logger.debug(
                `Got Twitch access token: "${this.accessToken.substring(
                    0,
                    9,
                )}...". Refreshing in 30 days.`,
            );
        };

        await generateToken();

        // app access token expiry is a fixed ~ 60 days, so generating a new one every 30 is *probably* good enough.
        this._refreshInterval = setInterval(
            () => generateToken(),
            Math.pow(2, 31) - 1,
        );
    }

    onModuleDestroy() {
        clearInterval(this._refreshInterval);
    }

    async getSubscriptions() {
        return (
            await new TwitchRequestBuilder()
                .setUrl(EventSubSubscriptions)
                .setMethod('GET')
                .setToken(this.accessToken)
                .setClientId(this.clientId)
                .send()
        ).data;
    }

    async createSubscription(type, userId) {
        return (
            await new TwitchRequestBuilder()
                .setUrl(EventSubSubscriptions)
                .setMethod('POST')
                .setToken(this.accessToken)
                .setClientId(this.clientId)
                .setData({
                    type,
                    version: 1,
                    condition: { broadcaster_user_id: userId },
                    transport: {
                        method: 'webhook',
                        callback: `https://${
                            this.configService.get<APIOptions>('api').host
                        }/twitch/eventsub`,
                        secret: this.configService.get<string>(
                            'TWITCH_WEBHOOK_SECRET',
                        ),
                    },
                })
                .send()
        ).data[0];
    }

    async deleteSubscription(id: string) {
        return await new TwitchRequestBuilder()
            .setUrl(EventSubSubscriptions)
            .setMethod('DELETE')
            .setToken(this.accessToken)
            .setClientId(this.clientId)
            .setParameter('id', id)
            .send(true, true);
    }

    async deleteAllSubscriptions() {
        for (const { id } of await this.getSubscriptions()) {
            const { status } = await this.deleteSubscription(id);
            this.logger.log(
                `Attempting to delete subscription with ID ${id}. Received status: ${status}.`,
            );
        }
    }

    async getChannelInformation(id: string) {
        return (
            await new TwitchRequestBuilder()
                .setUrl(Channels)
                .setMethod('GET')
                .setToken(this.accessToken)
                .setClientId(this.clientId)
                .setParameter('broadcaster_id', id)
                .send()
        ).data;
    }

    async searchChannels(
        query: string,
        filter?: { first?: number; after?: string; live_only?: boolean },
    ) {
        const builder = new TwitchRequestBuilder()
            .setUrl(SearchChannels)
            .setMethod('GET')
            .setToken(this.accessToken)
            .setClientId(this.clientId)
            .setParameter('query', query);

        if (filter) builder.setParameters(filter);

        return (await builder.send()).data;
    }

    async getChannelByName(name: string) {
        const result = await this.searchChannels(name, { first: 1 });

        if (result[0]?.broadcaster_login?.toLowerCase() !== name.toLowerCase())
            return null;
        else return result[0];
    }

    async getStream(userId: string) {
        return (
            (
                await new TwitchRequestBuilder()
                    .setUrl(Streams)
                    .setMethod('GET')
                    .setToken(this.accessToken)
                    .setClientId(this.clientId)
                    .setParameter('user_id', userId)
                    .send()
            ).data[0] ?? null
        );
    }
}
