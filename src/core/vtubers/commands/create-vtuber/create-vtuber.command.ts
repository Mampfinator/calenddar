import { CreateVTuberRequest } from 'src/core/vtubers/requests/create-vtuber-request.dto';

export class CreateVTuberCommand {
    constructor(public readonly createVtuberRequest: CreateVTuberRequest) {}
}
