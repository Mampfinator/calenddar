import { Injectable } from "@nestjs/common";
import { StreamEntityRepository } from "../streams/db/stream-entity.repository";
import { GenericStream } from "../streams/GenericStream";
import { StreamFactory } from "../streams/stream.factory";
import { VideoStatusEnum } from "../streams/stream.read";

@Injectable()
export class TwitchStreamFactory {
    constructor(
        private readonly streamFactory: StreamFactory,
        private readonly streamRepository: StreamEntityRepository
    ) {}
    async createFromHelixStream(helixStream): Promise<GenericStream> {
        return await this.streamFactory.create(
            helixStream.id,
            helixStream.user_id,
            "twitch",
            helixStream.title,
            VideoStatusEnum.Live
        );
    }

    async updateFromHelixStream(helixStream, stream: GenericStream) {
        const changes = {};

        // TODO: comparator function as optional argument (for tag lists, for example)
        const applyChange = (helixField: string, streamField: string): void => {
            if (helixStream[helixField] != stream[streamField]) {
                stream[streamField] = helixStream[helixField];
                changes[streamField] = helixField;
            }
        }

        // TODO: complete field updates
        applyChange("title", "title");

        await this.streamRepository.findOneAndReplaceById(stream._id, stream);

        return changes;
    }
    
}