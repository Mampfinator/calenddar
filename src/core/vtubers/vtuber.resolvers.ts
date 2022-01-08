import { Resolver, Query, Args } from '@nestjs/graphql';
import { VTuberRoot } from './VTuber';
import { VTuberReadRepository } from './db/vtuber-read.repository';
import { VTuberEntityRepository } from './db/vtuber-entity.repository';
import { BadRequestException } from '@nestjs/common';
import { ValidateObjectIdPipe, ValidateObjectIdsPipe } from '../../common/util';

@Resolver(() => VTuberRoot)
export class VTuberResolver {
    constructor(
        private vtubersReadRepository: VTuberReadRepository,
        private vtubersRepository: VTuberEntityRepository,
    ) {}

    @Query(() => VTuberRoot, { nullable: true })
    async vtuber(
        @Args('id', { type: () => String }, ValidateObjectIdPipe) id: string,
    ): Promise<VTuberRoot> {
        return (await this.vtubersRepository.findOneById(id)) ?? null;
    }

    @Query(() => [VTuberRoot])
    async vtubers(
        @Args(
            'ids',
            { type: () => [String], nullable: true },
            ValidateObjectIdsPipe,
        )
        ids: string[],
    ): Promise<VTuberRoot[]> {
        if (ids && ids.length > 0)
            return this.vtubersRepository.findMultipleByIds(ids);
        else return this.vtubersRepository.findAll();
    }

    @Query(() => [VTuberRoot])
    async search(@Args('text', { type: () => String }) text: string) {
        return this.vtubersRepository.findByQuery({
            $text: {
                $search: text,
                $caseSensitive: false,
                $diacriticSensitive: false,
            },
        });
    }

    @Query(() => [VTuberRoot])
    async findVtubersByPlatformIds(
        @Args('youtubeIds', { type: () => [String], nullable: true })
        youtubeIds: string[],
        @Args('twitchIds', { type: () => [String], nullable: true })
        twitchIds: string[],
    ) {
        if (!youtubeIds && !twitchIds)
            throw new BadRequestException(
                `At least one set of IDs is required.`,
            );
        return this.vtubersRepository.findByQuery({
            youtubeId: { $in: youtubeIds },
            twitchId: { $in: twitchIds },
        });
    }

    @Query(() => [VTuberRoot])
    async findByAffiliation(
        @Args('affiliation', { type: () => String }) affiliation: string,
    ) {
        return this.vtubersRepository.findByQuery({ affiliation });
    }
}
