import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTwitchStreamInfoCommand } from './update-twitch-stream-info.command';

@CommandHandler(UpdateTwitchStreamInfoCommand)
export class UpdateTwitchStreamInfoHandler
    implements ICommandHandler<UpdateTwitchStreamInfoCommand>
{
    constructor(private readonly) {}

    async execute(command: UpdateTwitchStreamInfoCommand): Promise<any> {
        //
    }
}
