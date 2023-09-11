"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_scalars_1 = require("graphql-scalars");
let customRatesGroupServicesType = new graphql_1.GraphQLObjectType({
    name: "customRatesGroupServicesType",
    description: "display every price custom group on the system",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        createdAt: { type: graphql_scalars_1.GraphQLDateTime },
        updatedAt: { type: graphql_scalars_1.GraphQLDateTime },
        businessUnitId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        businessLineId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        customRatesGroupId: { type: graphql_1.GraphQLInt },
        billableServiceId: { type: graphql_1.GraphQLInt },
        materialId: { type: graphql_1.GraphQLInt },
        equipmentItemId: { type: graphql_1.GraphQLInt },
        price: { type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(graphql_1.GraphQLInt)) },
        effectiveDate: { type: graphql_scalars_1.GraphQLDateTime },
        nextPrice: { type: graphql_1.GraphQLInt },
    }),
});
exports.default = customRatesGroupServicesType;
//# sourceMappingURL=types.js.map