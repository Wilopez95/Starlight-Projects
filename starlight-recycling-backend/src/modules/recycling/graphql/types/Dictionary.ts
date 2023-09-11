import { GraphQLScalarType } from 'graphql';
import { BaseEntity, ObjectLiteral } from 'typeorm';

export interface Dictionary<T> {
  [key: string]: T;
}

export function dictionary<T extends typeof BaseEntity>(Entity: T): ObjectLiteral {
  return new GraphQLScalarType({
    name: `${Entity.name}Dictionary`,
    description: 'Key value object',
    parseValue(value: Dictionary<typeof Entity>): Dictionary<typeof Entity> {
      return value;
    },
    serialize(value: Dictionary<typeof Entity>): Dictionary<typeof Entity> {
      return value;
    },
  });
}
