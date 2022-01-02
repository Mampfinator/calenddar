import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CommunityPostSchema } from "./communitypost.schema";
import {Model} from "mongoose";
import { CommunityPost } from "../communitypost.dto";

@Injectable()
export class CommunityPostReadRepository {
    constructor(
        @InjectModel(CommunityPostSchema.name) 
        private readonly postModel: Model<CommunityPostSchema>
    ) {}

    async findOneById(id: string): Promise<CommunityPost> {
        const post = await this.postModel.findOne({id});
        if (post) return CommunityPost.fromSchema(post);
        else throw new NotFoundException(`Could not find community post with ID ${id}`);
    }

    async findByChannelId(channelId: string): Promise<CommunityPost[]> {
        const posts = await this.postModel.find({channelId});
        return posts.map(post => CommunityPost.fromSchema(post));
    }
}