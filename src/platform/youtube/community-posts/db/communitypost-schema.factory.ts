import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { EntitySchemaFactory } from '../../../../core/database/entity-schema.factory';
import { CommunityPostRoot } from '../CommunityPost';
import { CommunityPostSchema } from './communitypost.schema';

@Injectable()
export class CommunityPostSchemaFactory
    implements EntitySchemaFactory<CommunityPostSchema, CommunityPostRoot>
{
    create(post: CommunityPostRoot): CommunityPostSchema {
        return {
            _id: new ObjectId(post._id),
            id: post.getId(),
            channelId: post.getChannelId(),
            text: post.getText(),
            attachment: post.getAttachment(),
        };
    }

    createFromSchema(schema: CommunityPostSchema): CommunityPostRoot {
        return new CommunityPostRoot(
            schema._id.toHexString(),
            schema.id,
            schema.channelId,
            schema.text,
            schema.attachment,
        );
    }
}
