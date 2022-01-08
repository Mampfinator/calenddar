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
import { APIOptions } from '../../../core/config/config';
import { HelixStream } from './interfaces/HelixStream';
import { HelixChannelInformation } from './interfaces/HelixChannelInformation';
import { HelixUser } from './interfaces/HelixUser';

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
                    .addParam('client_id', this.clientId)
                    .addParam('client_secret', this.secret)
                    .addParam('grant_type', 'client_credentials')
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
                .setBody({
                    type,
                    version: '1',
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
            .addParam('id', id)
            .send();
    }

    async deleteAllSubscriptions() {
        const subscriptions = await this.getSubscriptions();
        const deletionPromises = [];
        for (const { id } of subscriptions) {
            deletionPromises.push(this.deleteSubscription(id));
        }
        const failures = (await Promise.all(deletionPromises)).filter(
            ({ status }) => status !== 204,
        );
        this.logger.log(
            `Deleted ${
                subscriptions.length - failures.length
            } subscriptions successfully. ${
                failures.length > 0 ? `Failed deleting ${failures.length}.` : ''
            }`,
        );
    }

    async getChannelInformation(id: string): Promise<HelixChannelInformation> {
        return (
            await new TwitchRequestBuilder()
                .setUrl(Channels)
                .setMethod('GET')
                .setToken(this.accessToken)
                .setClientId(this.clientId)
                .addParam('broadcaster_id', id)
                .send()
        ).data[0];
    }

    async searchChannels(
        query: string,
        filter?: { first?: number; after?: string; live_only?: boolean },
    ): Promise<HelixUser[]> {
        const builder = new TwitchRequestBuilder()
            .setUrl(SearchChannels)
            .setMethod('GET')
            .setToken(this.accessToken)
            .setClientId(this.clientId)
            .addParam('query', query);

        if (filter) {
            const { first, after, live_only } = filter;
            if (first) builder.addParam('first', String(first));
            if (after) builder.addParam('after', after);
            if (live_only) builder.addParam('live_only', String(live_only));
        }

        return (await builder.send()).data;
    }

    async getChannelByName(name: string): Promise<HelixUser> {
        const result = await this.searchChannels(name, { first: 1 });

        if (result[0]?.display_name?.toLowerCase() !== name.toLowerCase())
            return null;
        else return result[0];
    }

    async getStream(userId: string): Promise<HelixStream> {
        return (
            (
                await new TwitchRequestBuilder()
                    .setUrl(Streams)
                    .setMethod('GET')
                    .setToken(this.accessToken)
                    .setClientId(this.clientId)
                    .addParam('user_id', userId)
                    .send()
            ).data[0] ?? null
        );
    }
}
