import { Prop, Schema } from '@nestjs/mongoose';
import { IdentifiableEntitySchema } from '../../database/identifiable-entity.schema';

@Schema({ versionKey: false, collection: 'streams' })
export class StreamSchema extends IdentifiableEntitySchema {
    @Prop() readonly streamId: string;
    @Prop() readonly channelId: string;
    @Prop() readonly title?: string;
    @Prop() readonly description?: string;
    @Prop() readonly platform: string;
    @Prop() readonly status: number;

    @Prop() readonly startedAt: Date;
    @Prop() readonly endedAt: Date;
    @Prop() readonly scheduledFor: Date;
}
