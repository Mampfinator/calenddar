import { Prop, Schema } from '@nestjs/mongoose';
import { IdentifiableEntitySchema } from '../../../database/identifiable-entity.schema';
import { CommunityPostAttachment as ICommunityPostAttachment } from '../scraping/YouTubeScraper';

export class CommunityPostAttachment implements ICommunityPostAttachment {
    public type: 'image' | 'poll' | 'video';
    public images?: string[];
    public choices?: string[];
    public video?: { id: string; thumbnail: string; title: string; descriptionSnippet: string; };
}

@Schema({ versionKey: false, collection: 'community_posts' })
export class CommunityPostSchema extends IdentifiableEntitySchema {
    @Prop() readonly id: string;
    @Prop() readonly channelId: string;
    @Prop() readonly text: string;
    @Prop({type: CommunityPostAttachment}) readonly attachment: CommunityPostAttachment
}