import { WsAdapter } from '@nestjs/platform-ws';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { APIOptions } from './config/config';
import { Logger } from '@nestjs/common';

(async () => {
    const logger = new Logger(`Main`);
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {bodyParser: false});
    app.useWebSocketAdapter(new WsAdapter(app));
    app.disable("x-powered-by");

    const configService: ConfigService = app.get(ConfigService);
    const apiOptions = configService.get<APIOptions>("api");

    logger.debug(`Starting webserver on host ${apiOptions.host} with local port ${apiOptions.port}`);

    await app.listen(apiOptions.port);
})();
