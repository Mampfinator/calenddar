import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Channels, EventSubSubscriptions, SearchChannels, Streams, TwitchOAuth2URL } from "./constants";
import { TwitchRequestBuilder } from "./classes/TwitchRequestBuilder";
import {default as ms} from "ms";
import { APIOptions } from "src/config/config";

interface AccessTokenGrant {
    access_token: string, 
    refresh_token: string, 
    expires_in: string
}

@Injectable()
export class TwitchAPIService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(TwitchAPIService.name);

    private readonly secret: string;
    private readonly clientId: string;

    private accessToken: string;
    private _refreshToken: string;
    private _expiresIn: number;
    private _refreshInterval: ReturnType<typeof setInterval>;


    constructor(
        private readonly configService: ConfigService
    ){
        this.secret = this.configService.get<string>("TWITCH_API_CLIENT_SECRET");
        this.clientId = this.configService.get<string>("TWITCH_API_CLIENT_ID");
    }

    async onModuleInit() {
        const { access_token, refresh_token, expires_in }: AccessTokenGrant = await new TwitchRequestBuilder()
            .setUrl(TwitchOAuth2URL)
            .setMethod("POST")
            .setParameter("client_id", this.clientId)
            .setParameter("client_secret", this.secret)
            .setParameter("grant_type", "client_credentials")
            .send();
        this.accessToken = access_token;

        this._refreshToken = refresh_token;
        this._expiresIn = parseInt(expires_in, 10);

        const refresh = async () => {
            const { refresh_token }: AccessTokenGrant = await new TwitchRequestBuilder()
                .setUrl(TwitchOAuth2URL)
                .setMethod("POST")
                .setParameter("client_id", this.clientId)
                .setParameter("grant_type", "refresh_token")
                .setParameter("client_secret", this.secret)
                .send();

            this._refreshToken = refresh_token;

            this.logger.debug(`Got new Twitch refresh token: "${refresh_token.substring(0, 9)}..."`);
        }

        // app access token expiry is a fixed ~ 60 days, so this should be good enough.
        this._refreshInterval = setInterval(() => refresh(), this._expiresIn - ms("30m"));
        this.logger.debug(`Got initial Twitch access token: "${access_token.substring(0, 9)}..." - expires in ${ms(this._expiresIn)}`);
    }

    onModuleDestroy() {
        clearInterval(this._refreshInterval);
    }

    async getSubscriptions() {
        return (await new TwitchRequestBuilder()
            .setUrl(EventSubSubscriptions)
            .setMethod("GET")
            .setToken(this.accessToken)
            .setClientId(this.clientId)
            .send()).data;
    }

    async createSubscription(type, userId) {
        return (await new TwitchRequestBuilder()
            .setUrl(EventSubSubscriptions)
            .setMethod("POST")
            .setToken(this.accessToken)
            .setClientId(this.clientId)
            .setData({
                type,
                version: 1, 
                condition: {broadcaster_user_id: userId},
                transport: {
                    method: "webhook",
                    callback: `https://${this.configService.get<APIOptions>("api").host}/twitch/eventsub`,
                    secret: this.configService.get<string>("TWITCH_WEBHOOK_SECRET")
                }
            })
            .send()).data[0];
    }

    async deleteSubscription(id: string) {
        return await new TwitchRequestBuilder()
            .setUrl(EventSubSubscriptions)
            .setMethod("DELETE")
            .setToken(this.accessToken)
            .setClientId(this.clientId)
            .setParameter("id", id)
            .send(true, true);
    }

    async deleteAllSubscriptions() {
        for (const {id} of await this.getSubscriptions()) {
            const {status} = await this.deleteSubscription(id);
            this.logger.log(`Attempting to delete subscription with ID ${id}. Received status: ${status}.`);
        }
    }

    async getChannelInformation(id: string) {
        return (await new TwitchRequestBuilder()
            .setUrl(Channels)
            .setMethod("GET")
            .setToken(this.accessToken)
            .setClientId(this.clientId)
            .setParameter("broadcaster_id", id)
            .send()
        ).data
    }

    async searchChannels(query: string, filter?: {first?: number, after?: string, live_only?: boolean}) {
        const builder = new TwitchRequestBuilder()
            .setUrl(SearchChannels)
            .setMethod("GET")
            .setToken(this.accessToken)
            .setClientId(this.clientId)
            .setParameter("query", query);

        if (filter) builder.setParameters(filter);

        return (await builder.send()).data;
    }

    async getChannelByName(name: string) {
        const result = await this.searchChannels(name, {first: 1});

        if (result[0]?.broadcaster_login?.toLowerCase() !== name.toLowerCase()) return null;
        else return result[0];
    }

    async getStream(userId: string) {
        return (await new TwitchRequestBuilder()
            .setUrl(Streams)
            .setMethod("GET")
            .setToken(this.accessToken)
            .setClientId(this.clientId)
            .setParameter("user_id", userId)
            .send()
        ).data[0] ?? null
    }

}