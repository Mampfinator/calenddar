import { Module } from "@nestjs/common";
import { TwitcastingAPIService } from "./twitcasting-api.service";

@Module({
    providers: [TwitcastingAPIService],
    exports: [TwitcastingAPIService]
})
export class TwitcastingAPIModule {}