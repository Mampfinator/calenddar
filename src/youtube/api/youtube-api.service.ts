import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Videos } from './constants';
import { YouTubeV3Video } from './interfaces/V3Video';
import { YouTubeRequestBuilder } from './YouTubeRequestBuilder';

@Injectable()
export class YouTubeAPIService {
    private readonly logger = new Logger(YouTubeAPIService.name);
    private readonly apiKey: string;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = configService.get<string>('YOUTUBE_API_KEY');
    }

    async getVideoById(id: string): Promise<YouTubeV3Video> {
        if (!id) throw new TypeError(`getVideoById - no ID provided!`);
        return (
            await new YouTubeRequestBuilder()
                .setApiKey(this.apiKey)
                .setUrl(Videos)
                .setParameter('id', id)
                .setPart(['liveStreamingDetails', 'id', 'snippet'])
                .send()
        ).items[0];
    }

    async getVideosByIds(...ids: string[]): Promise<YouTubeV3Video[]> {
        if (!ids || ids.length === 0) throw new TypeError(`No IDs provided!`);

        const idBatches: string[][] = [];
        for (let i = 0; i < ids.length; i += 50) {
            idBatches.push(ids.slice(i, i + 50));
        }

        this.logger.debug(
            `[getVideosByIds] Batches: ${idBatches.length}, total videos: ${ids.length}.`,
        );

        const items: YouTubeV3Video[] = [];
        for (const idBatch of idBatches) {
            const batchItems: YouTubeV3Video[] = (
                await new YouTubeRequestBuilder()
                    .setApiKey(this.apiKey)
                    .setUrl(Videos)
                    .setParameter('id', idBatch.join(','))
                    .setPart(['liveStreamingDetails', 'id', 'snippet'])
                    .send()
            ).items;

            // see if any videos we wanted to request are missing from the response, and add a minimum amount of data to indicate that to the return.
            const idSet = new Set<string>(idBatch);
            for (const item of batchItems) idSet.delete(item.id);
            for (const id of idSet)
                batchItems.push({
                    deleted: true,
                    id,
                });

            items.concat(batchItems);
        }

        return items;
    }
}
