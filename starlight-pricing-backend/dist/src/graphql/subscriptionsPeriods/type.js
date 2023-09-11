"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_scalars_1 = require("graphql-scalars");
const data_source_1 = require("../../data-source");
const PriceGroupsHistorical_1 = require("../../database/entities/tenant/PriceGroupsHistorical");
const type_1 = require("../priceGroupHistorical/type");
let subscriptionsPeriodsType = new graphql_1.GraphQLObjectType({
    name: "subscriptionPeriods",
    description: "display every subscription on the system",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        subscription_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        price_group_historical_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        status: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        billing_cycle: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        billing_type: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        override_proration: { type: graphql_1.GraphQLBoolean },
        recurring_services_amount: { type: graphql_1.GraphQLInt },
        recurring_services_prorated_amount: { type: graphql_1.GraphQLInt },
        recurring_services_overridden_prorated_amount: { type: graphql_1.GraphQLInt },
        recurring_services_total: { type: graphql_1.GraphQLInt },
        recurring_line_items_amount: { type: graphql_1.GraphQLInt },
        recurring_line_items_overridden_amount: { type: graphql_1.GraphQLInt },
        recurring_line_items_total: { type: graphql_1.GraphQLInt },
        recurring_line_items_overridden_total: { type: graphql_1.GraphQLInt },
        recurring_amount: { type: graphql_1.GraphQLInt },
        recurring_overridden_amount: { type: graphql_1.GraphQLInt },
        recurring_total: { type: graphql_1.GraphQLInt },
        recurring_overridden_total: { type: graphql_1.GraphQLInt },
        one_time_amount: { type: graphql_1.GraphQLInt },
        one_time_overridden_amount: { type: graphql_1.GraphQLInt },
        one_time_total: { type: graphql_1.GraphQLInt },
        one_time_overridden_total: { type: graphql_1.GraphQLInt },
        before_taxes_grand_total: { type: graphql_1.GraphQLInt },
        before_taxes_overridden_grand_total: { type: graphql_1.GraphQLInt },
        grand_total: { type: graphql_1.GraphQLInt },
        overridden_grand_total: { type: graphql_1.GraphQLInt },
        next_grand_total: { type: graphql_1.GraphQLInt },
        start_at: { type: new graphql_1.GraphQLNonNull(graphql_scalars_1.GraphQLDateTime) },
        end_at: { type: graphql_scalars_1.GraphQLDateTime },
        invoiced_at: { type: graphql_scalars_1.GraphQLDateTime },
        paid_at: { type: graphql_scalars_1.GraphQLDateTime },
        created_at: { type: graphql_scalars_1.GraphQLDateTime },
        price_group_historical: {
            type: type_1.default,
            resolve: (price) => {
                return data_source_1.AppDataSource.manager.findOneBy(PriceGroupsHistorical_1.PriceGroupsHistorical, {
                    id: price.price_group_id,
                });
            },
        },
    }),
});
exports.default = subscriptionsPeriodsType;
//# sourceMappingURL=type.js.map