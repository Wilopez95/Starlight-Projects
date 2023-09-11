"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_scalars_1 = require("graphql-scalars");
const data_source_1 = require("../../data-source");
const Orders_1 = require("../../database/entities/tenant/Orders");
const Prices_1 = require("../../database/entities/tenant/Prices");
const types_1 = require("../orders/types");
const type_1 = require("../prices/type");
let lineItemsType = new graphql_1.GraphQLObjectType({
    name: "lineItems",
    description: "display every lineItems on the system",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        order_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        orderId: {
            type: types_1.default,
            resolve: (orders) => {
                return data_source_1.AppDataSource.manager.findOneBy(Orders_1.Orders, {
                    id: orders.order_id,
                });
            },
        },
        billable_line_item_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        material_id: { type: graphql_1.GraphQLInt },
        global_rates_line_items_id: { type: graphql_1.GraphQLInt },
        custom_rates_group_line_items_id: { type: graphql_1.GraphQLInt },
        price: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        quantity: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        manifest_number: { type: graphql_1.GraphQLString },
        landfill_operation: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        price_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        priceId: {
            type: type_1.default,
            resolve: (price) => {
                return data_source_1.AppDataSource.manager.findOneBy(Prices_1.Prices, {
                    id: price.price_id,
                });
            },
        },
        override_price: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        overridden_price: { type: graphql_1.GraphQLInt },
        invoiced_at: { type: graphql_scalars_1.GraphQLDateTime },
        paid_at: { type: graphql_scalars_1.GraphQLDateTime },
        price_to_display: { type: graphql_1.GraphQLInt },
        created_at: { type: graphql_scalars_1.GraphQLDateTime },
        updated_at: { type: graphql_scalars_1.GraphQLDateTime },
        apply_surcharges: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
    }),
});
exports.default = lineItemsType;
//# sourceMappingURL=types.js.map