import { CreateVTuberRequest } from 'src/vtubers/requests/create-vtuber-request.dto';

export class CreateVTuberCommand {
    constructor(public readonly createVtuberRequest: CreateVTuberRequest) {}
}
