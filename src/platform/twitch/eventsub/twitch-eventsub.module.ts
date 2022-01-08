import { forwardRef, Module } from '@nestjs/common';
import { TwitchModule } from '../twitch.module';
import { TwitchEventSubService } from './eventsub.service';
import { TwitchEventFactory } from './twitch-event.factory';

@Module({
    imports: [forwardRef(() => TwitchModule)],
    providers: [TwitchEventSubService, TwitchEventFactory],
    exports: [TwitchEventSubService, TwitchEventFactory],
})
export class TwitchEventSubModule {}
