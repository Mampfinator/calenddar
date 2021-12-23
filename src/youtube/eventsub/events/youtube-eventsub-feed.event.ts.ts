import { IEvent } from "@nestjs/cqrs";
import Parser from "rss-parser";

export class YouTubeEventSubFeedEvent implements IEvent {
    static parser = new Parser({
        customFields: {
            item: [
                ["yt:videoId", "videoId"],
                ["yt:channelId", "channelId"],
                ["title"],
                ["author"]
            ]
        }
    });

    
    public readonly raw: string; 
    public videoId: string;
    public channelId: string;
    public title: string;
    public author: any;
    
    constructor(rawData: string) {
        this.raw = rawData;
    }

    async parse() {
        try {
            const parsedData = (await YouTubeEventSubFeedEvent.parser.parseString(this.raw)).items[0];
            this.videoId = parsedData.videoId;
            this.channelId = parsedData.channelId;
            this.title = parsedData.title;
            this.author = parsedData.author;
            return this;
        } catch (err) {
            throw new Error(`Could not parse provided XML string in YouTubeEventSubFeedEvent: ${this.raw}`);
        }
    }
    
}