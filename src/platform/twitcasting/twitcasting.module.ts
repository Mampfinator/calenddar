import { Module } from "@nestjs/common";
import {TwitcastingService} from "./twitcasting.service";
import {TwitcastingAPIModule} from "./api/twitcasting-api.module";

@Module({
    imports: [TwitcastingAPIModule],
    providers: [TwitcastingService],
    exports: [TwitcastingService],
})
export class TwitcastingModule {}