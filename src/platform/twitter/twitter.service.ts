import { Injectable } from "@nestjs/common";
import { TwitterApiService } from "./twitter-api.service";
import { flatten, chunk, pipe } from "ts-prime";
import { VTuberEntityRepository } from "src/core/vtubers/db/vtuber-entity.repository";

@Injectable()
export class TwitterService {
    constructor(
        private readonly apiService: TwitterApiService,
        private readonly vtuberRepository: VTuberEntityRepository
    ) {}
    
    // TODO
    async syncUserState(id: string) {
    }

    async syncUserStates(doNotifications = true) {
        const userIds = await this.vtuberRepository.getAllTwitterIds();
        const spaces = await Promise.all(
            chunk([...userIds], 100).map(ids => this.apiService.fetchSpaces(ids))
        ).then(flatten())
    }
}