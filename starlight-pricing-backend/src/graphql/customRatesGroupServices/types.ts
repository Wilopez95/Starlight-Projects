import { GraphQLObjectType, GraphQLNonNull, GraphQLInt, GraphQLList } from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';

const customRatesGroupServicesType: GraphQLObjectType = new GraphQLObjectType({
  name: 'customRatesGroupServicesType',
  description: 'display every price custom group on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
    businessUnitId: { type: new GraphQLNonNull(GraphQLInt) },
    businessLineId: { type: new GraphQLNonNull(GraphQLInt) },
    customRatesGroupId: { type: GraphQLInt },
    billableServiceId: { type: GraphQLInt },
    materialId: { type: GraphQLInt },
    equipmentItemId: { type: GraphQLInt },
    price: { type: new GraphQLNonNull(new GraphQLList(GraphQLInt)) },
    effectiveDate: { type: GraphQLDateTime },
    nextPrice: { type: GraphQLInt },
  }),
});

export default customRatesGroupServicesType;
