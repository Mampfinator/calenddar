import { UpdateChannelsRequest } from 'src/core/vtubers/requests/update-channels-request.dto';

export class UpdateChannelsCommand {
    constructor(public readonly updateChannelsRequest: UpdateChannelsRequest) {}
}
