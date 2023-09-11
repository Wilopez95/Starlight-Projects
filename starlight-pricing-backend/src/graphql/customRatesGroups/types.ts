import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLString,
  GraphQLList,
} from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';

const customRatesGroupsType: GraphQLObjectType = new GraphQLObjectType({
  name: 'customRatesGroupsType',
  description: 'display every  custom rate groups on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
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
    nonServiceHours: { type: GraphQLBoolean },
    spUsed: { type: GraphQLBoolean },
    validDays: { type: new GraphQLNonNull(new GraphQLList(GraphQLInt)) },
    startDate: { type: GraphQLDateTime },
    endDate: { type: GraphQLDateTime },
    serviceAreaIds: { type: new GraphQLList(GraphQLInt) },
    serviceDate: { type: GraphQLString },
    serviceAreaId: { type: GraphQLInt },
  }),
});

export default customRatesGroupsType;
