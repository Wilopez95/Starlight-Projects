"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_scalars_1 = require("graphql-scalars");
//import {GraphQLDateTime} from 'graphql-iso-date'
let priceGroupHistoricalType = new graphql_1.GraphQLObjectType({
    name: "priceGroupHistorical",
    description: "display every price group historical on the system",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        isGeneral: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        description: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        businessUnitId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        businessLineId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        serviceAreaIds: { type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(graphql_1.GraphQLInt)) },
        customerGroupId: { type: graphql_1.GraphQLInt },
        customerId: { type: graphql_1.GraphQLInt },
        customerJobSiteId: { type: graphql_1.GraphQLInt },
        active: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        validDays: { type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(graphql_1.GraphQLInt)) },
        overweightSetting: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        usageDaysSetting: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        demurrageSetting: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        dumpSetting: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        loadSetting: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        startDate: { type: graphql_scalars_1.GraphQLDateTime },
        endDate: { type: graphql_scalars_1.GraphQLDateTime },
        original_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        event_type: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        user_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        created_at: { type: graphql_scalars_1.GraphQLDateTime },
        updated_at: { type: graphql_scalars_1.GraphQLDateTime },
        trace_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    }),
});
exports.default = priceGroupHistoricalType;
//# sourceMappingURL=type.js.map