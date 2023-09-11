"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_scalars_1 = require("graphql-scalars");
let serviceAreasCustomRatesGroupsType = new graphql_1.GraphQLObjectType({
    name: "serviceAreasCustomRatesGroupsType",
    description: "display every service area custom rates group on the system",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        createdAt: { type: graphql_scalars_1.GraphQLDateTime },
        updatedAt: { type: graphql_scalars_1.GraphQLDateTime },
        serviceAreaId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        businessLineId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        customRatesGroupId: { type: graphql_1.GraphQLInt },
    }),
});
exports.default = serviceAreasCustomRatesGroupsType;
//# sourceMappingURL=type.js.map