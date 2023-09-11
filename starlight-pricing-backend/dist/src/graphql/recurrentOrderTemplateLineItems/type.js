"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_scalars_1 = require("graphql-scalars");
const data_source_1 = require("../../data-source");
const Prices_1 = require("../../database/entities/tenant/Prices");
const RecurrentOrderTemplates_1 = require("../../database/entities/tenant/RecurrentOrderTemplates");
const type_1 = require("../prices/type");
const type_2 = require("../recurrentOrderTemplate/type");
let recurrentOrderTemplateLineItemsType = new graphql_1.GraphQLObjectType({
    name: "recurrentOrderTemplateLineItems",
    description: "display every recurrent order template line items on the system",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        recurrent_order_template_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        billable_line_item_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        material_id: { type: graphql_1.GraphQLInt },
        global_rates_line_items_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        custom_rates_group_line_items_id: { type: graphql_1.GraphQLInt },
        price: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        quantity: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        apply_surcharges: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        price_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        created_at: { type: graphql_scalars_1.GraphQLDateTime },
        updated_at: { type: graphql_scalars_1.GraphQLDateTime },
        prices: {
            type: type_1.default,
            resolve: (price) => {
                return data_source_1.AppDataSource.manager.findOneBy(Prices_1.Prices, {
                    id: price.price_id,
                });
            },
        },
        recurrentOrderTemplateId: {
            type: type_2.default,
            resolve: (recurrentOrder) => {
                return data_source_1.AppDataSource.manager.findOneBy(RecurrentOrderTemplates_1.RecurrentOrderTemplate, {
                    id: recurrentOrder.recurrent_order_template_id,
                });
            },
        },
    }),
});
exports.default = recurrentOrderTemplateLineItemsType;
//# sourceMappingURL=type.js.map