import { IEvent } from "@nestjs/cqrs";
import Parser from "rss-parser";

export class YouTubeEventSubFeedEvent implements IEvent {
    public videoId: string;
    public channelId: string;
    public title: string;
    public author: any;
    
    constructor(data) {
        this.videoId = data.videoId;
        this.channelId = data.channelId;
        this.title = data.title;
        this.author = data.author;
    }
}