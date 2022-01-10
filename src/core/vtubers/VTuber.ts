import { Field, ObjectType } from '@nestjs/graphql';
import { AggregateRoot } from '@nestjs/cqrs';

@ObjectType()
export class VTuberRoot extends AggregateRoot {
    @Field({ description: 'Unique identifier of a specific VTuber.' })
    private readonly id: string;
    @Field({ description: 'Romanized name of a VTuber.' })
    private readonly name: string;
    @Field({
        nullable: true,
        description:
            "VTuber's name in original/common alternative writing system. Usually Japanese.",
    })
    private readonly originalName?: string;
    @Field({ description: 'A VTuber\'s agency/company, or "indie" if none.' })
    private affiliation: string;
    @Field({ nullable: true, description: "A VTuber's YouTube channel ID." })
    private youtubeId: string;
    @Field({
        nullable: true,
        description:
            "A VTuber's Twitch channel ID. This is not their login name, but a unique number.",
    })
    private twitchId: string;

    // TODO: API work
    private twitterId: string;
    private twitcastingId: string;

    constructor(
        id: string,
        name: string,
        originalName: string,
        affiliation,
        youtubeId: string,
        twitchId: string,
        twitterId: string,
        twitcastingId: string,
    ) {
        super();
        this.id = id;
        this.name = name;
        this.originalName = originalName;
        this.youtubeId = youtubeId;
        this.twitchId = twitchId;
        this.affiliation = affiliation;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getOriginalName() {
        return this.originalName;
    }

    getYoutubeId() {
        return this.youtubeId;
    }

    getTwitchId() {
        return this.twitchId;
    }

    getTwitterId() {
        return this.twitterId;
    }

    getTwitcastingId() {
        return this.twitcastingId;
    }

    getAffiliation() {
        return this.affiliation;
    }

    setChannelId(
        platform: 'twitch' | 'youtube' | 'twitter' | 'twitcasting',
        id?: string,
    ) {
        if (id === undefined) return;
        const key: `${typeof platform}Id` = `${platform}Id`;

        if (id === null) this[key] = undefined;
        else this[key] = id;
    }
}
