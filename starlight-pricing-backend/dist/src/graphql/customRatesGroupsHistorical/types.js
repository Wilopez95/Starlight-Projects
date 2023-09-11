"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_scalars_1 = require("graphql-scalars");
let customRatesGroupsHistoricalType = new graphql_1.GraphQLObjectType({
    name: "customRatesGroupsHistoricalType",
    description: "display every price custom group historical on the system",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        originalId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        eventType: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        userId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        createdAt: { type: graphql_scalars_1.GraphQLDateTime },
        updatedAt: { type: graphql_scalars_1.GraphQLDateTime },
        traceId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        businessUnitId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        businessLineId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        active: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        description: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        overweightSetting: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        usageDaysSetting: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        demurrageSetting: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        customerGroupId: { type: graphql_1.GraphQLInt },
        customerId: { type: graphql_1.GraphQLInt },
        customerJobSiteId: { type: graphql_1.GraphQLInt },
        dumpSetting: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        loadSetting: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        nonServiceHours: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        spUsed: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        validDays: { type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(graphql_1.GraphQLInt)) },
        startDate: { type: graphql_scalars_1.GraphQLDateTime },
        endDate: { type: graphql_scalars_1.GraphQLDateTime },
    }),
});
exports.default = customRatesGroupsHistoricalType;
//# sourceMappingURL=types.js.map