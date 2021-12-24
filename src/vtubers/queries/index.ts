import { VTubersHandler } from './vtubers.handler';
import { VTuberByIDHandler } from './vtuber-by-id.handler';
import { LiveVTubersHandler } from './get-live.handler';

export const VTuberQueryHandlers = [
    VTubersHandler,
    VTuberByIDHandler,
    LiveVTubersHandler,
];
