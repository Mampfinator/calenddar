import { CreateVTuberHandler } from './create-vtuber/create-vtuber.handler';
import { UpdateChannelsHandler } from './update-channels/update-channels.handler';
import { DeleteVTuberHandler } from './delete-vtuber/delete-vtuber.handler';

export const VTuberCommandHandlers = [
    CreateVTuberHandler,
    UpdateChannelsHandler,
    DeleteVTuberHandler,
];
