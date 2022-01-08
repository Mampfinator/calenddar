import { CommunityPostRoot } from '../CommunityPost';

export class CommunityPostCreatedEvent {
    constructor(public readonly post: CommunityPostRoot) {}
}
