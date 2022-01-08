import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum VideoStatusEnum {
    Live,
    Offline,
    Upcoming,
}
registerEnumType(VideoStatusEnum, { name: 'VideoStatus' });

export const videoStatusResolver: Record<keyof typeof VideoStatusEnum, string> =
    {
        Live: 'live',
        Offline: 'offline',
        Upcoming: 'upcoming',
    };

// public-facing data-structure that combines all stream types
@ObjectType({ description: 'Represents a stream on any given platform.' })
export class Stream {
    // Generic fields
    @Field({ description: 'Platform-specific stream ID.' }) readonly id: string;
    @Field({
        description:
            'Platform-specific ID of the channel the stream belongs to.',
    })
    readonly channelId: string;
    @Field({ description: 'Which platform the stream is on.' })
    readonly platform: string;
    @Field({ nullable: true }) readonly title: string;

    // YouTube fields
    @Field({ nullable: true }) readonly description: string;
    @Field({ nullable: true }) readonly startedAt: Date;
    @Field({ nullable: true }) readonly endedAt: Date;
    @Field({ nullable: true }) readonly scheduledFor: Date;

    @Field(() => VideoStatusEnum, {
        nullable: true,
        description: "The stream's status.",
    })
    readonly status?: VideoStatusEnum;

    constructor(
        id: string,
        channelId: string,
        platform: string,
        title: string,
        status: VideoStatusEnum,
        description?: string,
        startedAt?: Date,
        endedAt?: Date,
        scheduledFor?: Date,
    ) {
        this.id = id;
        this.channelId = channelId;
        this.platform = platform;
        this.title = title;
        this.status = status;

        // YouTube fields
        this.description = description;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
        this.scheduledFor = scheduledFor;
    }
}
