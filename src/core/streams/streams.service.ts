import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class StreamsService {
    private readonly logger = new Logger(StreamsService.name);

    constructor() {}
}
