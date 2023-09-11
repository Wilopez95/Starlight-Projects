"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const data_source_1 = require("../../data-source");
const graphql_scalars_1 = require("graphql-scalars");
const type_1 = require("../prices/type");
const Prices_1 = require("../../database/entities/tenant/Prices");
const type_2 = require("../subscriptionOrder/type");
const SubscriptionOrders_1 = require("../../database/entities/tenant/SubscriptionOrders");
let subscriptionOrdersLineItemsType = new graphql_1.GraphQLObjectType({
    name: "subscriptionOrdersLineItems",
    description: "display every subscription orders line items on the system",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        subscription_work_order_id: { type: graphql_1.GraphQLInt },
        billable_line_item_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        global_rates_line_items_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        custom_rates_group_line_items_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        price: { type: graphql_1.GraphQLInt },
        quantity: { type: graphql_1.GraphQLInt },
        material_id: { type: graphql_1.GraphQLInt },
        work_order_line_item_id: { type: graphql_1.GraphQLInt },
        unlock_overrides: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        invoiced_at: { type: graphql_scalars_1.GraphQLDateTime },
        paid_at: { type: graphql_scalars_1.GraphQLDateTime },
        price_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        priceId: {
            type: type_1.default,
            resolve: (price) => {
                return data_source_1.AppDataSource.manager.findOneBy(Prices_1.Prices, {
                    id: price.price_id,
                });
            },
        },
        created_at: { type: graphql_scalars_1.GraphQLDateTime },
        updated_at: { type: graphql_scalars_1.GraphQLDateTime },
        subscription_order_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        subscriptionOrderId: {
            type: type_2.default,
            resolve: (subscriptionOrder) => {
                return data_source_1.AppDataSource.manager.findOneBy(SubscriptionOrders_1.SubscriptionOrders, {
                    id: subscriptionOrder.subscription_order_id,
                });
            },
        },
    }),
});
exports.default = subscriptionOrdersLineItemsType;
//# sourceMappingURL=type.js.map