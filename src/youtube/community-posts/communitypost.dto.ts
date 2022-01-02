import { CommunityPostRoot } from "./CommunityPost";
import { CommunityPostSchema } from "./db/communitypost.schema";
import { CommunityPostAttachment } from "./scraping/YouTubeScraper";

export class CommunityPost {
    public id: string;
    public channelId: string;
    public text: string;
    public attachment: CommunityPostAttachment;

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