import { ICommand } from "@nestjs/cqrs";
import { HelixStream } from "@twurple/api";

export class UpdateTwitchStreamInfoCommand implements ICommand {
    constructor(
        public readonly helixStream: HelixStream
    ) {}
}