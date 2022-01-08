import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseEntityRepository } from '../../../../core/database/base-entity.repository';
import { CommunityPostRoot } from '../CommunityPost';
import { CommunityPostSchema } from './communitypost.schema';
import { CommunityPostSchemaFactory } from './communitypost-schema.factory';

@Injectable()
export class CommunityPostEntityRepository extends BaseEntityRepository<
    CommunityPostSchema,
    CommunityPostRoot
> {
    constructor(
        @InjectModel(CommunityPostSchema.name)
        postModel: Model<CommunityPostSchema>,
        postSchemaFactory: CommunityPostSchemaFactory,
    ) {
        super(postModel, postSchemaFactory);
    }

    findOneByPublicId(id: string) {
        return this.findOne({
            id,
        });
    }
}
