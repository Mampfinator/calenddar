import { AggregateRoot } from '@nestjs/cqrs';
import { ObjectId } from 'mongodb';
import { FilterQuery } from 'mongoose';
import { EntityRepository } from './entity.repository';

import { IdentifiableEntitySchema } from './identifiable-entity.schema';

export abstract class BaseEntityRepository<
    TSchema extends IdentifiableEntitySchema,
    TEntity extends AggregateRoot,
> extends EntityRepository<TSchema, TEntity> {
    async findOneById(id: string): Promise<TEntity> {
        return this.findOne({ _id: new ObjectId(id) } as FilterQuery<TSchema>);
    }

    async findMultipleByIds(ids: string[]): Promise<TEntity[]> {
        //@ts-ignore
        return this.find({
            _id: ids.map((id) => new ObjectId(id)),
        });
    }

    async findOneAndReplaceById(id: string, entity: TEntity): Promise<void> {
        await this.findOneAndReplace(
            { _id: new ObjectId(id) } as FilterQuery<TSchema>,
            entity,
        );
    }

    async deleteOneById(id: string): Promise<void> {
        await this.delete({ _id: new ObjectId(id) } as TSchema);
    }

    async findAll(): Promise<TEntity[]> {
        return this.find({});
    }

    async findByQuery(query: FilterQuery<TSchema>): Promise<TEntity[]> {
        return this.find(query);
    }

    async findOneByQuery(query: FilterQuery<TSchema>): Promise<TEntity> {
        return this.findOne(query);
    }
}
