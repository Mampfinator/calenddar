import {
    Body,
    Controller,
    Get,
    Post,
    Param,
    HttpException,
    NotFoundException,
    Delete,
    Patch,
    UseInterceptors,
    CacheInterceptor,
    CacheTTL,
} from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { VTuber } from './vtuber.dto';
import { CreateVTuberCommand } from './commands/create-vtuber/create-vtuber.command';
import { CreateVTuberRequest } from './requests/create-vtuber-request.dto';
import { VTubersQuery } from './queries/vtubers.query';
import { UpdateChannelsRequest } from './requests/update-channels-request.dto';
import { VTuberByIDQuery } from './queries/vtuber-by-id.query';
import { UpdateChannelsCommand } from './commands/update-channels/update-channels.command';
import { ValidateObjectIdPipe } from '../util';
import { DeleteVTuberCommand } from './commands/delete-vtuber/delete-vtuber.command';
import { VTuberDeletedEvent } from './events/vtuber-deleted.event';
import { LiveVTubersQuery } from './queries/get-live.event';
import { Throttle } from "@nestjs/throttler";
@UseInterceptors(CacheInterceptor)
@Controller('vtubers')
export class VTubersController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
    ) {}

    @Get()
    @CacheTTL(300)
    @Throttle(1, 60)
    async getVTubers(): Promise<VTuber[]> {
        return this.queryBus.execute<VTubersQuery, VTuber[]>(
            new VTubersQuery(),
        );
    }

    @Get('live')
    async getLiveVTubers() {
        return this.queryBus.execute<LiveVTubersQuery, VTuber[]>(
            new LiveVTubersQuery('all'),
        );
    }

    @Delete(':id')
    async deleteVTuber(
        @Param('id', ValidateObjectIdPipe) vtuberId: string,
    ): Promise<void> {
        try {
            await this.commandBus.execute<DeleteVTuberCommand, void>(
                new DeleteVTuberCommand(vtuberId),
            );
            await this.eventBus.publish(new VTuberDeletedEvent(vtuberId));
        } catch (e) {
            if (e instanceof HttpException) throw e;
        }
    }

    @Get(':id')
    async getVTuber(
        @Param('id', ValidateObjectIdPipe) vtuberId: string,
    ): Promise<VTuber> {
        try {
            return await this.queryBus.execute<VTuberByIDQuery, VTuber>(
                new VTuberByIDQuery(vtuberId),
            );
        } catch {
            throw new NotFoundException(`No VTuber with ID ${vtuberId} found.`);
        }
    }

    @Get('live/:id')
    async getVTuberLiveStatus(@Param('id', ValidateObjectIdPipe) id: string) {
        //
    }

    @Post()
    async createVTuber(
        @Body() createVtuberRequest: CreateVTuberRequest,
    ): Promise<void> {
        await this.commandBus.execute<CreateVTuberCommand, void>(
            new CreateVTuberCommand(createVtuberRequest),
        );
    }

    @Patch(':id/channels')
    async updateChannels(
        @Param('id', ValidateObjectIdPipe) id: string,
        @Body() updateChannelsRequest: UpdateChannelsRequest,
    ): Promise<VTuber> {
        try {
            await this.commandBus.execute<UpdateChannelsCommand, void>(
                new UpdateChannelsCommand({ ...updateChannelsRequest, id }),
            );
        } catch (e) {
            if (e instanceof HttpException) {
                if (e.getStatus() === 404)
                    throw new NotFoundException(
                        `Could not find VTuber with ID ${id}.`,
                    );
            } else throw e;
        }

        return await this.queryBus.execute<VTuberByIDQuery, VTuber>(
            new VTuberByIDQuery(id),
        );
    }
}
