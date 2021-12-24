import { WsAdapter } from '@nestjs/platform-ws';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { APIOptions } from './config/config';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

(async () => {
    const logger = new Logger(`Main`);
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        bodyParser: false,
    });
    app.useWebSocketAdapter(new WsAdapter(app));
    app.disable('x-powered-by');

    const config = new DocumentBuilder()
        .setTitle('CalenDDar')
        .setDescription('Multi-platform VTuber API')
        .setVersion('0.1')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger-api', app, document);

    const configService: ConfigService = app.get(ConfigService);
    const apiOptions = configService.get<APIOptions>('api');

    logger.debug(
        `Starting webserver on host ${apiOptions.host} with local port ${apiOptions.port}`,
    );

    await app.listen(apiOptions.port);
})();
