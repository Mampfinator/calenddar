import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { VTuberFactory } from '../../vtuber.factory';
import { CreateVTuberCommand } from './create-vtuber.command';
import { TwitchAPIService } from '../../../../platform/twitch/api/twitch-api.service';
import { TwitchService } from '../../../../platform/twitch/twitch.service';
import { TwitchEventSubService } from '../../../../platform/twitch/eventsub/eventsub.service';
import { YouTubeService } from '../../../../platform/youtube/youtube.service';
import { YouTubeEventSubService } from '../../../../platform/youtube/eventsub/youtube-eventsub.service';
@CommandHandler(CreateVTuberCommand)
export class CreateVTuberHandler
    implements ICommandHandler<CreateVTuberCommand>
{
    constructor(
        private readonly vtuberFactory: VTuberFactory,
        private readonly eventPublisher: EventPublisher,
        private readonly twitchApiService: TwitchAPIService,
        private readonly twitchService: TwitchService,
        private readonly twitchEventsubService: TwitchEventSubService,
        private readonly youtubeService: YouTubeService,
        private readonly youtubeEventsubService: YouTubeEventSubService,
    ) {}

    async execute({ createVtuberRequest }: CreateVTuberCommand) {
        let {
            name,
            originalName,
            affiliation,
            youtubeId,
            twitchId,
            twitchName,
            twitterId,
            twitcastingId,
        } = createVtuberRequest;

        if (!twitchId && twitchName)
            twitchId = (
                await this.twitchApiService.getChannelByName(twitchName)
            )?.id;
        const vtuber = this.eventPublisher.mergeObjectContext(
            await this.vtuberFactory.create(
                name,
                originalName,
                affiliation,
                youtubeId,
                twitchId,
                twitterId,
                twitcastingId,
            ),
        );

        if (vtuber.getTwitchId()) {
            await this.twitchService.syncUserState(vtuber.getTwitchId());
            await this.twitchEventsubService.subscribe(vtuber.getTwitchId());
        }

        if (vtuber.getYoutubeId()) {
            await this.youtubeService.syncFeedVideoState(vtuber.getYoutubeId());
            await this.youtubeEventsubService.subscribe(vtuber.getYoutubeId());
        }

        vtuber.commit();
    }
}
