import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { EntitySchemaFactory } from 'src/database/entity-schema.factory';
import { VTuberRoot } from '../VTuber';
import { VTuberSchema } from './vtuber.schema';

@Injectable()
export class VTuberSchemaFactory
    implements EntitySchemaFactory<VTuberSchema, VTuberRoot>
{
    create(vtuber: VTuberRoot): VTuberSchema {
        return {
            _id: new ObjectId(vtuber.getId()),
            name: vtuber.getName(),
            originalName: vtuber.getOriginalName(),
            affiliation: vtuber.getAffiliation(),
            youtubeId: vtuber.getYoutubeId(),
            twitchId: vtuber.getTwitchId(),
        };
    }

    createFromSchema(vtuberSchema: VTuberSchema): VTuberRoot {
        return new VTuberRoot(
            vtuberSchema._id.toHexString(),
            vtuberSchema.name,
            vtuberSchema.originalName,
            vtuberSchema.affiliation,
            vtuberSchema.youtubeId,
            vtuberSchema.twitchId,
        );
    }
}
