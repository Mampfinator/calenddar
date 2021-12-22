import {forwardRef, Module} from "@nestjs/common";
import { TwitchModule } from "../twitch.module";
import { TwitchAPIService } from "./twitch-api.service";

@Module({
    imports: [forwardRef(() => TwitchModule)],
    providers: [TwitchAPIService],
    exports: [TwitchAPIService]
})
export class TwitchAPIModule {}