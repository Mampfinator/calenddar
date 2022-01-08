import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import { IdentifiableEntitySchema } from '../../../../core/database/identifiable-entity.schema';
import { CommunityPostAttachment as ICommunityPostAttachment } from '../scraping/YouTubeScraper';

@ObjectType()
export class CommunityPostVideo {
    @Field() id: string;
    @Field() thumbnail: string;
    @Field() title: string;
    @Field() descriptionSnippet: string;
}
@ObjectType()
export class CommunityPostAttachment implements ICommunityPostAttachment {
    @Field() public type: 'image' | 'poll' | 'video';
    @Field(() => [String], { nullable: true }) public images?: string[];
    @Field(() => [String], { nullable: true }) public choices?: string[];
    @Field(() => CommunityPostVideo, { nullable: true })
    public video?: CommunityPostVideo;
}

@Schema({ versionKey: false, collection: 'community_posts' })
export class CommunityPostSchema extends IdentifiableEntitySchema {
    @Prop() readonly id: string;
    @Prop() readonly channelId: string;
    @Prop() readonly text: string;
    @Prop({ type: CommunityPostAttachment })
    readonly attachment: CommunityPostAttachment;
}
