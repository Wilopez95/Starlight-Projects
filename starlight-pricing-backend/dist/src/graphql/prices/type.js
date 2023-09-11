"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_scalars_1 = require("graphql-scalars");
const type_1 = require("../priceGroup/type");
const data_source_1 = require("../../data-source");
const PriceGroups_1 = require("../../database/entities/tenant/PriceGroups");
//import {GraphQLDateTime} from 'graphql-iso-date'
let priceType = new graphql_1.GraphQLObjectType({
    name: "price",
    description: "display every price on the system",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        price_group_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        entity_type: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        billable_service_id: { type: graphql_1.GraphQLInt },
        billable_line_item_id: { type: graphql_1.GraphQLInt },
        equipment_item_id: { type: graphql_1.GraphQLInt },
        material_id: { type: graphql_1.GraphQLInt },
        threshold_id: { type: graphql_1.GraphQLInt },
        surcharge_id: { type: graphql_1.GraphQLInt },
        billing_cycle: { type: graphql_1.GraphQLString },
        frequency_id: { type: graphql_1.GraphQLInt },
        price: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        next_price: { type: graphql_1.GraphQLInt },
        limit: { type: graphql_1.GraphQLInt },
        start_at: { type: new graphql_1.GraphQLNonNull(graphql_scalars_1.GraphQLDateTime) },
        end_at: { type: graphql_scalars_1.GraphQLDateTime },
        user_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        created_at: { type: graphql_scalars_1.GraphQLDateTime },
        trace_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        price_group: {
            type: type_1.default,
            resolve: (price) => {
                return data_source_1.AppDataSource.manager.findOneBy(PriceGroups_1.PriceGroups, {
                    id: price.price_group_id,
                });
            },
        },
    }),
});
exports.default = priceType;
//# sourceMappingURL=type.js.map