import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLString,
  GraphQLList,
} from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';
//import {GraphQLDateTime} from 'graphql-iso-date'

const priceGroupHistoricalType: GraphQLObjectType = new GraphQLObjectType({
  name: 'priceGroupHistorical',
  description: 'display every price group historical on the system',
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
    endDate: { type: GraphQLDateTime },
    original_id: { type: new GraphQLNonNull(GraphQLInt) },
    event_type: { type: new GraphQLNonNull(GraphQLString) },
    user_id: { type: new GraphQLNonNull(GraphQLString) },
    created_at: { type: GraphQLDateTime },
    updated_at: { type: GraphQLDateTime },
    trace_id: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export default priceGroupHistoricalType;
