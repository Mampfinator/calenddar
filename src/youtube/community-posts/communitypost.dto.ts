import { ObjectType, Field } from "@nestjs/graphql";
import { CommunityPostRoot } from "./CommunityPost";
import { CommunityPostSchema } from "./db/communitypost.schema";
import { CommunityPostAttachment } from "./db/communitypost.schema";
@ObjectType({description: "A YouTube Community Post because YouTube doesn't offer their own API."})
export class CommunityPost {
    @Field({description: "Unique ID dictated by YouTube."}) public id: string;
    @Field({description: "ID of the channel this post belongs to."}) public channelId: string;
    @Field({description: "Text content of the post.", nullable: true}) public text: string;
    @Field(() => CommunityPostAttachment, {description: "Attachment of the post."}) public attachment: CommunityPostAttachment;

    static fromSchema(schema: CommunityPostSchema) {
        return new CommunityPost(
            schema.id,
            schema.channelId,
            schema.text,
            schema.attachment
        );
    }

    static fromRoot(root: CommunityPostRoot) {
        return new CommunityPost(
            root.getId(),
            root.getChannelId(),
            root.getText(),
            root.getAttachment()
        );
    }

    constructor(id: string, channelId: string, text: string, attachment: CommunityPostAttachment) {
        this.id = id;
        this.channelId = channelId;
        this.text = text;
        this.attachment = attachment;
    }
}