"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const data_source_1 = require("../../data-source");
const Prices_1 = require("../../database/entities/tenant/Prices");
const type_1 = require("../prices/type");
let subscriptionsRecurringType = new graphql_1.GraphQLObjectType({
    name: "subscriptionRecurringLineItemsSchedule",
    description: "display every subscription Recurring Line Items Schedule on the system",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        subscription_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        subscription_recurring_line_item_id: {
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt),
        },
        billable_line_item_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        price_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        billing_cycle: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        quantity: { type: graphql_1.GraphQLInt },
        override_price: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        override_proration: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        price: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        overridden_price: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        next_price: { type: graphql_1.GraphQLInt },
        amount: { type: graphql_1.GraphQLInt },
        prorated_amount: { type: graphql_1.GraphQLInt },
        overridden_prorated_amount: { type: graphql_1.GraphQLInt },
        total: { type: graphql_1.GraphQLInt },
        start_at: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        end_at: { type: graphql_1.GraphQLString },
        invoiced_at: { type: graphql_1.GraphQLString },
        paid_at: { type: graphql_1.GraphQLString },
        prices: {
            type: type_1.default,
            resolve: (price) => {
                return data_source_1.AppDataSource.manager.findOneBy(Prices_1.Prices, {
                    id: price.price_id,
                });
            },
        },
    }),
});
exports.default = subscriptionsRecurringType;
//# sourceMappingURL=type.js.map