import { createParamDecorator, ExecutionContext, Logger } from "@nestjs/common";
import { TwitchEventNotificationFactory } from "./TwitchEventNotificationFactory";

const logger = new Logger("@EventSub");

// builds an EventNotification after the TwitchEventSubGuard has verified if a message from Twitch is genuine.
// also doesn't need to handle challenge requests as those are handled by the guard.
export const EventSub = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        const {body, challenge} = req;

        if (challenge) {
            logger.debug(`Returning challenge ${challenge} from EventSub decorator.`);
            return challenge;
        }
        return TwitchEventNotificationFactory.create(body);
    }
)