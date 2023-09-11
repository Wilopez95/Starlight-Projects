import { GraphQLScalarType } from 'graphql';

export const OrderHistoryScalar = new GraphQLScalarType({
  name: 'HaulingOrderHistory',
  description: 'A Scalar that represents order history',
  parseValue(value: Record<string, unknown>): Record<string, unknown> {
    return value; // get as is
  },
  serialize(value: Record<string, unknown>): Record<string, unknown> {
    return value; // send as is
  },
});
