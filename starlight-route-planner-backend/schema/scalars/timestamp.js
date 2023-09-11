import { GraphQLScalarType, Kind } from 'graphql';

export const resolver = {
  Timestamp: new GraphQLScalarType({
    name: 'Timestamp',
    description: 'Timestamp scalar type representing date as timestamp in number',
    serialize(value) {
      return value.getTime();
    },
    parseValue(value) {
      return value;
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10);
      }

      return null;
    },
  }),
};
