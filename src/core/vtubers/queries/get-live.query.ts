export class LiveVTubersQuery {
    constructor(public readonly platforms?: string[] | string) {
        if (
            !platforms ||
            platforms == 'all' ||
            (platforms.includes('all') && platforms.length === 1)
        )
            this.platforms = ['twitch', 'youtube'];
    }
}
