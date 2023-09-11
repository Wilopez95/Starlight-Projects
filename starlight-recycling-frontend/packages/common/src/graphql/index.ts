import { Resolvers } from '@apollo/client';

import { TYPE_DEFS } from './queries';
import { UserInfoMutations } from './queries/user';

export const typeDefs = TYPE_DEFS;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface AppResolvers extends Resolvers {
  // We will update this with our app's resolvers later
}

export const resolvers = {
  Mutation: {
    ...UserInfoMutations,
  },
};
