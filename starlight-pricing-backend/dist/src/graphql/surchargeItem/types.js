"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_scalars_1 = require("graphql-scalars");
const data_source_1 = require("../../data-source");
const LineItems_1 = require("../../database/entities/tenant/LineItems");
const Orders_1 = require("../../database/entities/tenant/Orders");
const Prices_1 = require("../../database/entities/tenant/Prices");
const ThresholdItems_1 = require("../../database/entities/tenant/ThresholdItems");
const types_1 = require("../lineItems/types");
const types_2 = require("../orders/types");
const type_1 = require("../prices/type");
const types_3 = require("../thresholdItems/types");
let surchargeItemType = new graphql_1.GraphQLObjectType({
    name: "surchargeItem",
    description: "display every surchargeItem on the system",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        order_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        orderId: {
            type: types_2.default,
            resolve: (orders) => {
                return data_source_1.AppDataSource.manager.findOneBy(Orders_1.Orders, {
                    id: orders.order_id,
                });
            },
        },
        surcharge_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        billable_line_item_id: { type: graphql_1.GraphQLInt },
        billable_service_id: { type: graphql_1.GraphQLInt },
        threshold_id: { type: graphql_1.GraphQLInt },
        material_id: { type: graphql_1.GraphQLInt },
        global_rates_surcharges_id: { type: graphql_1.GraphQLInt },
        custom_rates_group_surcharges_id: { type: graphql_1.GraphQLInt },
        amount: { type: graphql_1.GraphQLInt },
        quantity: { type: graphql_1.GraphQLInt },
        price_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        priceId: {
            type: type_1.default,
            resolve: (price) => {
                return data_source_1.AppDataSource.manager.findOneBy(Prices_1.Prices, {
                    id: price.price_id,
                });
            },
        },
        invoiced_at: { type: graphql_scalars_1.GraphQLDateTime },
        paid_at: { type: graphql_scalars_1.GraphQLDateTime },
        amount_to_display: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        created_at: { type: graphql_scalars_1.GraphQLDateTime },
        updated_at: { type: graphql_scalars_1.GraphQLDateTime },
        line_item_id: { type: graphql_1.GraphQLInt },
        lineItemId: {
            type: types_1.default,
            resolve: (lineItem) => {
                return data_source_1.AppDataSource.manager.findOneBy(LineItems_1.LineItems, {
                    id: lineItem.line_item_id,
                });
            },
        },
        threshold_item_id: { type: graphql_1.GraphQLInt },
        thresholdItemId: {
            type: types_3.default,
            resolve: (thresholdItem) => {
                return data_source_1.AppDataSource.manager.findOneBy(ThresholdItems_1.ThresholdItems, {
                    id: thresholdItem.threshold_item_id,
                });
            },
        },
    }),
});
exports.default = surchargeItemType;
//# sourceMappingURL=types.js.map