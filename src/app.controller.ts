import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly config: ConfigService,
    ) {}

    @Get()
    async status() {
        return { status: 'OK' };
    }

    @Get('supported_platforms')
    async platforms() {
        return { platforms: this.config.get('platforms') };
    }
}
