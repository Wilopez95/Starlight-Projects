import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLString,
  GraphQLList,
} from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';

const priceGroupType: GraphQLObjectType = new GraphQLObjectType({
  name: 'priceGroup',
  description: 'display every price group on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    isGeneral: { type: new GraphQLNonNull(GraphQLBoolean) },
    description: { type: new GraphQLNonNull(GraphQLString) },
    businessUnitId: { type: new GraphQLNonNull(GraphQLInt) },
    businessLineId: { type: new GraphQLNonNull(GraphQLInt) },
    serviceAreaIds: { type: new GraphQLNonNull(new GraphQLList(GraphQLInt)) },
    customerGroupId: { type: GraphQLInt },
    customerId: { type: GraphQLInt },
    customerJobSiteId: { type: GraphQLInt },
    active: { type: new GraphQLNonNull(GraphQLBoolean) },
    validDays: { type: new GraphQLNonNull(new GraphQLList(GraphQLInt)) },
    overweightSetting: { type: new GraphQLNonNull(GraphQLString) },
    usageDaysSetting: { type: new GraphQLNonNull(GraphQLString) },
    demurrageSetting: { type: new GraphQLNonNull(GraphQLString) },
    dumpSetting: { type: new GraphQLNonNull(GraphQLString) },
    loadSetting: { type: new GraphQLNonNull(GraphQLString) },
    startDate: { type: GraphQLDateTime },
    nonServiceHours: { type: new GraphQLNonNull(GraphQLBoolean) },
    spUsed: { type: new GraphQLNonNull(GraphQLBoolean) },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
    endDate: { type: GraphQLString },
  }),
});

export default priceGroupType;
