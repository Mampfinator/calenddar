import { YouTubeV3Video } from "../api/interfaces/V3Video";

export class APIVideoStatusException extends Error {

    constructor(public readonly video: YouTubeV3Video) {
        super(`Could not determine status for [${video.id}]: ${video.snippet.title}.`);
    };
}