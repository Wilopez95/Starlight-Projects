import { GraphQLScalarType } from 'graphql';

function coerceCoordinates(value) {
  return value;
}

function parseCoordinates(valueAST) {
  return valueAST.value;
}

export const resolver = {
  Coordinates: new GraphQLScalarType({
    name: 'Coordinates',
    description: 'A (multidimensional) set of coordinates following x, y order.',
    serialize: coerceCoordinates,
    parseValue: coerceCoordinates,
    parseLiteral: parseCoordinates,
  }),
};
