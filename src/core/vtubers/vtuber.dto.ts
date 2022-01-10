// TODO: move descriptions & decorators from VTuberRoot to VTuber class.
import { ObjectId } from 'mongodb';
import { VTuberSchema } from './db/vtuber.schema';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VTuber {
    constructor({
        _id,
        name,
        originalName,
        youtubeId,
        twitchId,
        twitterId,
        twitcastingId,
        affiliation,
    }: VTuberSchema) {
        this.id = _id;
        this.name = name;
        this.originalName = originalName;
        this.youtubeId = youtubeId;
        this.twitchId = twitchId;
        this.twitterId = twitterId;
        this.twitcastingId = twitcastingId;
        this.affiliation = affiliation;
    }

    @Field() readonly id: ObjectId;
    @Field() readonly name: string;
    @Field() readonly originalName: string;
    @Field() readonly affiliation: string;

    @Field() readonly twitchId?: string;
    @Field() readonly youtubeId?: string;
    @Field() readonly twitterId?: string;
    @Field() readonly twitcastingId?: string;
}
