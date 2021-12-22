import { IEvent } from "@nestjs/cqrs";
import Parser from "rss-parser";

export class YouTubeEventSubFeedEvent implements IEvent {
    static parser = new Parser();

    public readonly data: {[key: string]: any};
    public readonly raw: string; 
    constructor(data: string) {
        this.data = YouTubeEventSubFeedEvent.parser.parseString(data);
        this.raw = data;
    }
}