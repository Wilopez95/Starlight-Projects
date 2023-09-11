import { GraphQLObjectType, GraphQLNonNull, GraphQLInt } from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';

const serviceAreasCustomRatesGroupsType: GraphQLObjectType = new GraphQLObjectType({
  name: 'serviceAreasCustomRatesGroupsType',
  description: 'display every service area custom rates group on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
    serviceAreaId: { type: new GraphQLNonNull(GraphQLInt) },
    businessLineId: { type: new GraphQLNonNull(GraphQLInt) },
    customRatesGroupId: { type: GraphQLInt },
  }),
});

export default serviceAreasCustomRatesGroupsType;
