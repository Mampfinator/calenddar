import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { base64encode } from 'ts-prime';
import { TwitcastingWebhookEvent } from './interfaces/types';
import { TwitcastingRequestBuilder } from './TwitcastingRequestBuilder';

@Injectable()
export class TwitcastingAPIService {
    private readonly token: string;
    constructor(private readonly config: ConfigService) {
        const secret = config.get<string>('TWITCASTING_CLIENT_ID');
        const id = config.get<string>('TWITCASTING_CLIENT_SECRET');
        this.token = base64encode(`${secret}:${id}`);
    }

    public async getCurrentLive(userId: string) {
        return new TwitcastingRequestBuilder();
    }

    public async search(words: string, lang = 'ja') {
        return new TwitcastingRequestBuilder()

            .setToken(this.token)
            .addParam('words', words)
            .addParam('lang', lang)
            .send();
    }

    public async registerWebhook(
        userId: string,
        events: TwitcastingWebhookEvent[],
    ) {
        return new TwitcastingRequestBuilder()
            .setToken(this.token)
            .setMethod('POST')
            .setBody({
                user_id: userId,
                events,
            })
            .send();
    }

    public async removeWebhook(userId: string) {
        return new TwitcastingRequestBuilder()
            .setToken(this.token)
            .setMethod('DELETE')
            .addParam('user_id', userId)
            .addParam('events[]', 'livestart');
    }
}
