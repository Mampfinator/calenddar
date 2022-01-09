export class CreateVTuberRequest {
    name: string;
    originalName?: string;
    affiliation: string;
    
    youtubeId?: string;

    twitchId?: string;
    twitchName?: string;

    twitterId?: string;
    twitterName?: string;

    twitcastingId?: string;
    twitcastingName?: string;
}
