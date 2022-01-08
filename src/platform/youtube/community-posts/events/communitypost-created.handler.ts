import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommunityPost } from '../communitypost.dto';
import { YouTubeCommunityPostsService } from '../youtube-community-posts.service';
import { CommunityPostCreatedEvent } from './communitypost-created.event';

@EventsHandler(CommunityPostCreatedEvent)
export class CommunityPostCreatedHandler
    implements IEventHandler<CommunityPostCreatedEvent>
{
    constructor(
        private readonly communityPostService: YouTubeCommunityPostsService,
        private readonly eventEmitter: EventEmitter2,
    ) {}
    handle({ post }: CommunityPostCreatedEvent) {
        // TODO: let webevents know that a new post has been detected.
        if (this.communityPostService.hasFetchedInitial())
            this.eventEmitter.emit(
                'webevents.youtube.post',
                CommunityPost.fromRoot(post),
            );
    }
}
