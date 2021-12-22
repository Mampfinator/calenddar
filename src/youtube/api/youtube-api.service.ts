import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class YouTubeAPIService {
    private readonly apiKey: string;

    constructor(
        private readonly configService: ConfigService
    ) {
        this.apiKey = configService.get<string>("YOUTUBE_API_KEY");
    }


}