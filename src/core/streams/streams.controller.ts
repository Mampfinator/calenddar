import { Controller } from '@nestjs/common';
import { StreamsService } from './streams.service';

@Controller('streams')
export class StreamsController {
    constructor(private readonly streamsService: StreamsService) {}
}
