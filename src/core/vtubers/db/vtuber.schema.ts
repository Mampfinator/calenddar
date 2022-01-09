import { Prop, Schema } from '@nestjs/mongoose';
import { IdentifiableEntitySchema } from '../../database/identifiable-entity.schema';

@Schema({ versionKey: false, collection: 'vtubers' })
export class VTuberSchema extends IdentifiableEntitySchema {
    @Prop() readonly name: string;
    @Prop() readonly originalName: string;
    @Prop() readonly affiliation: string;
    @Prop() readonly youtubeId: string;
    @Prop() readonly twitchId: string;
    @Prop() readonly twitterId: string;
    @Prop() readonly twitcastingId: string;
}
