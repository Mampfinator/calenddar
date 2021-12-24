import { ICommand } from '@nestjs/cqrs';
import { HelixStream } from '../../api/interfaces/HelixStream';

export class UpdateTwitchStreamInfoCommand implements ICommand {
    constructor(public readonly helixStream: HelixStream) {}
}
