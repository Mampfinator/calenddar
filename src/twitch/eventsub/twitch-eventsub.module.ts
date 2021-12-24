import { forwardRef, Module } from '@nestjs/common';
import { TwitchModule } from '../twitch.module';
import { TwitchEventSubService } from './eventsub.service';

@Module({
    imports: [forwardRef(() => TwitchModule)],
    providers: [TwitchEventSubService],
    exports: [TwitchEventSubService],
})
export class TwitchEventSubModule {}
