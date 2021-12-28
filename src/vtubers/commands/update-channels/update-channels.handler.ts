import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { TwitchAPIService } from '../../../twitch/api/twitch-api.service';
import { TwitchEventSubService } from '../../../twitch/eventsub/eventsub.service';
import { TwitchService } from '../../../twitch/twitch.service';
import { YouTubeEventSubService } from '../../../youtube/eventsub/youtube-eventsub.service';
import { YouTubeService } from '../../../youtube/youtube.service';
import { VTuberEntityRepository } from '../../db/vtuber-entity.repository';
import { UpdateChannelsCommand } from './update-channels.command';

@CommandHandler(UpdateChannelsCommand)
export class UpdateChannelsHandler
    implements ICommandHandler<UpdateChannelsCommand>
{
    constructor(
        private readonly vtuberEntityRepository: VTuberEntityRepository,
        private readonly eventPublisher: EventPublisher,
        private readonly twitchApiService: TwitchAPIService,
        private readonly twitchService: TwitchService,
        private readonly twitchEventsubService: TwitchEventSubService,
        private readonly youtubeService: YouTubeService,
        private readonly youtubeEventsubService: YouTubeEventSubService
    ) {}

    async execute({ updateChannelsRequest }: UpdateChannelsCommand) {
        let { id, youtubeId, twitchId, twitchName } = updateChannelsRequest;
        const vtuber = await this.eventPublisher.mergeObjectContext(
            await this.vtuberEntityRepository.findOneById(id),
        );
        if (!twitchId && twitchName) twitchId = (await this.twitchApiService.getChannelByName(twitchName)).id;
        
        if (youtubeId && vtuber.getYoutubeId() !== youtubeId) {
            vtuber.setChannelId('youtube', youtubeId);
            await this.youtubeService.syncFeedVideoState(youtubeId);
            await this.youtubeEventsubService.subscribe(youtubeId);
        }
        if (twitchId && vtuber.getTwitchId() !== twitchId) {
            vtuber.setChannelId('twitch', twitchId);
            await this.twitchService.syncUserState(twitchId);
            await this.twitchEventsubService.subscribe(twitchId);
        }

        await this.vtuberEntityRepository.findOneAndReplaceById(id, vtuber);

        vtuber.commit();
    }
}
