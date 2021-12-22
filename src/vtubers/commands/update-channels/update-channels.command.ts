import { UpdateChannelsRequest } from 'src/vtubers/requests/update-channels-request.dto';

export class UpdateChannelsCommand {
    constructor(public readonly updateChannelsRequest: UpdateChannelsRequest) {}
}
