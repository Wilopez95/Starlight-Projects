/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseEntity as BaseEntityClass,
  CreateDateColumn,
  EntityNotFoundError,
  FindConditions,
  ObjectLiteral,
  ObjectType,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType as GraphQLObjectType } from 'type-graphql';
import { findEntityBasedOnQuery } from '../utils/findEntityBasedOnQuery';
import { GraphQLResolveInfo } from 'graphql';

@GraphQLObjectType({ isAbstract: true })
export class BaseEntity extends BaseEntityClass {
  static findAndSelectForQuery<T extends BaseEntity>(
    this: ObjectType<T>,
    info: GraphQLResolveInfo,
    where: string | ObjectLiteral | FindConditions<T> | FindConditions<T>[],
    relations?: string[],
  ): Promise<T[]> {
    return findEntityBasedOnQuery(this, info, where, relations) as any;
  }

  static async findOneAndSelectForQuery<T extends BaseEntity>(
    this: ObjectType<T>,
    info: GraphQLResolveInfo,
    where: string | ObjectLiteral | FindConditions<T> | FindConditions<T>[],
    relations?: string[],
  ): Promise<T | null> {
    const values = await (this as typeof BaseEntity).findAndSelectForQuery(info, where, relations);

    return (values[0] as any) || null;
  }

  static async findOneOrFailAndSelectForQuery<T extends BaseEntity>(
    this: ObjectType<T>,
    info: GraphQLResolveInfo,
    where: string | ObjectLiteral | FindConditions<T> | FindConditions<T>[],
    relations?: string[],
  ): Promise<T> {
    const values = await (this as typeof BaseEntity).findAndSelectForQuery(info, where, relations);

    if (values[0] === undefined) {
      throw new EntityNotFoundError(this, where);
    }

    return values[0] as any;
  }

  @Field()
  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt!: Date;

  @Field()
  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt!: Date;

  // eslint-disable-next-line
  // @ts-ignore
  // eslint-disable-next-line
  useContext(ctx: any): void {}
}

export default BaseEntity;
