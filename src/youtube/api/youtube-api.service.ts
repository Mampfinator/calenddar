import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Parser from 'rss-parser';
import { Videos } from './constants';
import { YouTubeV3Video } from './interfaces/V3Video';
import { YouTubeRequestBuilder } from './YouTubeRequestBuilder';
import { isValidDate } from '../../util';
import { VideoStatusEnum } from '../../streams/stream.read';
import { APIVideoStatusException } from '../errors/APIVideoStatusException';

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
                .send().catch(e => this.logger.error(e))
        )?.items[0];
    }

    async getVideosByIds(...ids: string[]): Promise<YouTubeV3Video[]> {
        if (!ids || ids.length === 0) throw new TypeError(`No IDs provided!`);

        const idBatches: string[][] = [];
        for (let i = 0; i < ids.length; i += 50) {
            idBatches.push(ids.slice(i, i + 50));
        }

        const items: YouTubeV3Video[] = [];
        for (const idBatch of idBatches) {
            let hasFailed = false;
            const batchItems: YouTubeV3Video[] = (
                await new YouTubeRequestBuilder()
                    .setApiKey(this.apiKey)
                    .setUrl(Videos)
                    .setParameter('id', idBatch.join(','))
                    .setPart(['liveStreamingDetails', 'id', 'snippet'])
                    .send().catch(e => {
                        this.logger.error(e);
                        hasFailed = true;
                    })
            )?.items ?? [];
            
            // temporary solution until I figure out why YouTube keeps throwing Forbidden responses at me.
            if (hasFailed) break;
            
            // see if any videos we wanted to request are missing from the response, and add a minimum amount of data to indicate that to the return.
            const idSet = new Set<string>(idBatch);
            for (const item of batchItems) idSet.delete(item.id);
            for (const id of idSet) {
                this.logger.debug(`Video with ID ${id} will be marked as deleted.`);
                batchItems.push({
                    deleted: true,
                    id,
                });
            }

            items.push(...batchItems);
        }

        return items;
    }

    async fetchRecentVideosFromFeed(channelId: string) {
        const parser = new Parser({customFields: {item: [["yt:videoId", "videoId"], ["yt:channelId", "channelId"]]}});
        const {items} = await parser.parseURL(`https://youtube.com/feeds/videos.xml?channel_id=${channelId}`);
        return items;
    }


    extractInfoFromApiVideo(video: YouTubeV3Video) {
        const {id: streamId} = video;
        const { snippet, liveStreamingDetails } = video;
        // general details
        const { channelId, title, description, liveBroadcastContent } = snippet;

        var status: VideoStatusEnum;
        switch (liveBroadcastContent) {
            case 'live':
                status = VideoStatusEnum.Live;
                break;
            case undefined:
            case 'none':
                status = VideoStatusEnum.Offline;
                break;
            case 'upcoming':
                status = VideoStatusEnum.Upcoming;
                break;
            default: 
                throw new APIVideoStatusException(video);
        }

        if (liveStreamingDetails) {
            // figure out times
            const { scheduledStartTime, actualStartTime, actualEndTime } =
                liveStreamingDetails;

            var startedAt = new Date(actualStartTime);
            var scheduledFor = new Date(scheduledStartTime);
            var endedAt = new Date(actualEndTime);

            startedAt = isValidDate(startedAt) ? startedAt : undefined;
            scheduledFor = isValidDate(scheduledFor) ? scheduledFor : undefined;
            endedAt = isValidDate(endedAt) ? endedAt : undefined;
        }

        return {
            streamId,
            channelId,
            title, 
            description,
            startedAt,
            scheduledFor,
            endedAt,
            status
        }
    }
}
