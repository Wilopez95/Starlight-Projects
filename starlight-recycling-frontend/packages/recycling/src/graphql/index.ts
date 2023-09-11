import { TYPE_DEFS, mutations, resolvers as customResolvers } from './queries';

export const typeDefs = TYPE_DEFS;

export const resolvers = {
  ...customResolvers,
  Mutation: {
    ...mutations,
  },
};
