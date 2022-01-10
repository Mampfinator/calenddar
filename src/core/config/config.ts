import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import * as dotenv from 'dotenv';

export interface APIOptions {
    host: string;
    port: number;
}

export interface YouTubeOptions {
    quotaLimit: number;
    usableQuota: number;
}

export interface ThrottlerOptions {
    ttl: number;
    limit: number;
}

export interface GraphQLOptions {
    playground?: boolean;
    introspection?: boolean;
}

export default () => {
    const verifyEnv = (
        envConfig: dotenv.DotenvParseOutput,
        ...fields: string[]
    ) => {
        for (const field of fields)
            if (!envConfig[field])
                throw new TypeError(`[.env] ${field} not set!`);
    };

    const envConfig = dotenv.parse(
        readFileSync(join(__dirname, '..', '..', '..', '.env')),
    );
    verifyEnv(
        envConfig,
        'MONGODB_URI',
        'YOUTUBE_API_KEY',
        'YOUTUBE_WEBHOOK_SECRET',
        'TWITCH_API_CLIENT_ID',
        'TWITCH_API_CLIENT_SECRET',
        'TWITCH_WEBHOOK_SECRET',
        'ADMIN_API_KEY', // temporary solution
        'TWITTER_TOKEN',
    );

    const yamlConfig = yaml.load(
        readFileSync(
            join(
                __dirname,
                '..',
                '..',
                '..',
                `config.${process.env.NODE_ENV ?? 'development'}.yaml`,
            ),
            'utf8',
        ),
    ) as Record<string, any>;

    if (!yamlConfig.api)
        throw new TypeError('[config file] api options not found!');
    if (!yamlConfig.api.host)
        throw new TypeError('[config file] api.host not found!');
    if (!yamlConfig.api.port)
        throw new TypeError('[config file] api.port not found!');

    // less integral parts of the config get magic default values.
    if (!yamlConfig.youtube)
        yamlConfig.youtube = { quotaLimit: 10000, usableQuota: 1 };
    if (!yamlConfig.youtube.quotaLimit) yamlConfig.youtube.quotaLimit = 10000;
    if (!yamlConfig.youtube.usableQuota) yamlConfig.youtube.usableQuota = 1;

    if (!yamlConfig.throttler)
        yamlConfig.throttler = {} as { [key: string]: number };
    if (!yamlConfig.throttler.ttl) yamlConfig.throttler.ttl = 10;
    if (!yamlConfig.throttler.limit) yamlConfig.throttler.limit = 10;

    return { ...envConfig, ...yamlConfig } as Record<string, any>;
};
