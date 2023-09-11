import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLString,
  GraphQLList,
} from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';

const customRatesGroupsHistoricalType: GraphQLObjectType = new GraphQLObjectType({
  name: 'customRatesGroupsHistoricalType',
  description: 'display every price custom group historical on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    originalId: { type: new GraphQLNonNull(GraphQLBoolean) },
    eventType: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLString) },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
    traceId: { type: new GraphQLNonNull(GraphQLString) },
    businessUnitId: { type: new GraphQLNonNull(GraphQLInt) },
    businessLineId: { type: new GraphQLNonNull(GraphQLInt) },
    active: { type: new GraphQLNonNull(GraphQLBoolean) },
    description: { type: new GraphQLNonNull(GraphQLString) },
    overweightSetting: { type: new GraphQLNonNull(GraphQLString) },
    usageDaysSetting: { type: new GraphQLNonNull(GraphQLString) },
    demurrageSetting: { type: new GraphQLNonNull(GraphQLString) },
    customerGroupId: { type: GraphQLInt },
    customerId: { type: GraphQLInt },
    customerJobSiteId: { type: GraphQLInt },
    dumpSetting: { type: new GraphQLNonNull(GraphQLString) },
    loadSetting: { type: new GraphQLNonNull(GraphQLString) },
    nonServiceHours: { type: new GraphQLNonNull(GraphQLBoolean) },
    spUsed: { type: new GraphQLNonNull(GraphQLBoolean) },
    validDays: { type: new GraphQLNonNull(new GraphQLList(GraphQLInt)) },
    startDate: { type: GraphQLDateTime },
    endDate: { type: GraphQLDateTime },
  }),
});

export default customRatesGroupsHistoricalType;
