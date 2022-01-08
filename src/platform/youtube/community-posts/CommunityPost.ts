import { AggregateRoot } from "@nestjs/cqrs";
import { CommunityPostAttachment } from "./scraping/YouTubeScraper";

export class CommunityPostRoot extends AggregateRoot {

    constructor(
        public readonly _id: string,
        private readonly id: string,
        private readonly channelId: string,
        private readonly text: string,
        private readonly attachment?: CommunityPostAttachment,
    ) {
        super()
    }

    getId() {return this.id}
    getChannelId() {return this.channelId}
    getText() {return this.text}
    getAttachment() {return this.attachment}
    getAttachmentType() {return this.attachment.type}

}