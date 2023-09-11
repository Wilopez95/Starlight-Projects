"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_scalars_1 = require("graphql-scalars");
let customRatesGroupsType = new graphql_1.GraphQLObjectType({
    name: "customRatesGroupsType",
    description: "display every  custom rate groups on the system",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        createdAt: { type: graphql_scalars_1.GraphQLDateTime },
        updatedAt: { type: graphql_scalars_1.GraphQLDateTime },
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
        nonServiceHours: { type: graphql_1.GraphQLBoolean },
        spUsed: { type: graphql_1.GraphQLBoolean },
        validDays: { type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(graphql_1.GraphQLInt)) },
        startDate: { type: graphql_scalars_1.GraphQLDateTime },
        endDate: { type: graphql_scalars_1.GraphQLDateTime },
        serviceAreaIds: { type: new graphql_1.GraphQLList(graphql_1.GraphQLInt) },
        serviceDate: { type: graphql_1.GraphQLString },
        serviceAreaId: { type: graphql_1.GraphQLInt }
    }),
});
exports.default = customRatesGroupsType;
//# sourceMappingURL=types.js.map