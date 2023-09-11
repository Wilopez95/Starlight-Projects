/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLResolveInfo } from 'graphql';
import { BaseEntity, FindConditions, ObjectLiteral, ObjectType } from 'typeorm';
import { getColumnsToSelectFromQuery } from './getColumnsToSelectFromQuery';

export const findEntityBasedOnQuery = <T extends BaseEntity>(
  Entity: ObjectType<T>,
  info: GraphQLResolveInfo,
  where: string | ObjectLiteral | FindConditions<BaseEntity> | FindConditions<BaseEntity>[],
  relations?: string[],
): Promise<T> => {
  const columnsToSelect = getColumnsToSelectFromQuery(Entity, info);

  return ((Entity as typeof BaseEntity).find({
    where,
    relations,
    select: columnsToSelect,
  }) as any) as Promise<T>;
};
