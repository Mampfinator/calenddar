import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Videos } from "./constants";
import { YouTubeAPIVideo } from "./interfaces/YouTubeAPIVideo";
import { YouTubeRequestBuilder } from "./YouTubeRequestBuilder";

@Injectable()
export class YouTubeAPIService {
    private readonly apiKey: string;

    constructor(
        private readonly configService: ConfigService
    ) {
        this.apiKey = configService.get<string>("YOUTUBE_API_KEY");
    }

    async getVideoById(id: string): Promise<YouTubeAPIVideo> {
        return (await new YouTubeRequestBuilder()
            .setApiKey(this.apiKey)
            .setUrl(Videos)
            .setParameter("id", id)
            .setPart(["liveStreamingDetails", "id", "snippet"])
            .send()).items[0];
    }

    // TODO: do multiple requests & join if ids.length > 50
    // TODO: if an ID is missing, add it back to the return 
    async getVideosByIds(...ids: string[]) {
        return (await new YouTubeRequestBuilder()
            .setApiKey(this.apiKey)
            .setUrl(Videos)
            .setParameter("id", ids.join(","))
            .setPart(["liveStreamingDetails", "id", "snippet"])
            .send()).items;
    }

    async 


}