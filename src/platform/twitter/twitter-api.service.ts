import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwitterAPIRequestBuilder } from './TwitterAPIRequestBuilder';
import { Spaces, UserByName } from './urls';

@Injectable()
export class TwitterApiService {
    private readonly logger = new Logger();
    constructor(private readonly config: ConfigService) {}

    async getUserByName(name: string) {
        return await new TwitterAPIRequestBuilder()
            .setUrl(UserByName(name))
            .setToken(this.config.get<string>('TWITCH_ACCESS_TOKEN'))
            .send()
            .catch((e) => this.logger.error(e));
    }

    async fetchSpaces(ids: string[]) {
        return await new TwitterAPIRequestBuilder()
            .setUrl(Spaces)
            .addParam('user_ids', ids.join(','))
            .addParam(
                'space.fields',
                'id,state,started_at,ended_at,title,scheduled_start',
            )
            .setToken(this.config.get<string>('TWITCH_ACCESS_TOKEN'))
            .send()
            .catch((e) => this.logger.error(e));
    }
}
