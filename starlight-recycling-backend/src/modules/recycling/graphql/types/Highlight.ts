import { GraphQLScalarType } from 'graphql';

export type HighlightType = { [key: string]: string[] };

export const HighlightScalar = new GraphQLScalarType({
  name: `Highlight`,
  description: 'Key value object',
  parseValue(value: HighlightType): HighlightType {
    return value;
  },
  serialize(value: HighlightType): HighlightType {
    return value;
  },
});
