export class LiveVTubersQuery {
    constructor(public readonly platforms?: string[] | string) {
        if (!platforms || platforms == 'all' || platforms.includes('all'))
            this.platforms = ['twitch', 'youtube'];
    }
}
