/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLResolveInfo } from 'graphql';
import { BaseEntity, ObjectType } from 'typeorm';

export const getColumnsToSelectFromQuery = <T extends BaseEntity>(
  Entity: ObjectType<T>,
  info: GraphQLResolveInfo,
): (keyof T)[] => {
  const topLevelFields =
    info.fieldNodes
      ?.find(({ name }) => name.value == info.fieldName)
      ?.selectionSet?.selections.map((selection: any) => selection?.name.value) || [];
  const metadata = (Entity as typeof BaseEntity)
    .getRepository()
    .manager.connection.getMetadata(Entity);

  return metadata.columns
    .filter(
      ({ propertyName, relationMetadata, isPrimary }) =>
        isPrimary ||
        topLevelFields.includes(propertyName) ||
        (relationMetadata && topLevelFields.includes(relationMetadata.propertyName)),
    )
    .map(({ databaseName }) => databaseName) as (keyof T)[];
};
