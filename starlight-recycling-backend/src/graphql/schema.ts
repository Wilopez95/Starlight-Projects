import { GraphQLSchema } from 'graphql';
import { NonEmptyArray } from 'type-graphql';
import { buildFederatedSchema } from '../utils/buildFederatedSchema';
import { resolvers as adminResolvers } from '../modules/admin/graphql';
import {
  orphanedTypes as recyclingOrphanedTypes,
  resolvers as recyclingResolvers,
} from '../modules/recycling';

class GraphSchema {
  schema: GraphQLSchema;

  constructor() {
    this.schema = buildFederatedSchema({
      resolvers: [...adminResolvers, ...recyclingResolvers] as NonEmptyArray<any>,
      orphanedTypes: [...recyclingOrphanedTypes],
    });
  }
}

export const generatedSchema = new GraphSchema();
