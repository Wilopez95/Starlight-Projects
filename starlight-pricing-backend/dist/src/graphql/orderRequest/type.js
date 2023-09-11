"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_scalars_1 = require("graphql-scalars");
let orderRequestType = new graphql_1.GraphQLObjectType({
    name: "orderRequest",
    description: "display every order request on the system",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        customer_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        contractor_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        status: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        job_site_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        job_site_2_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        billable_service_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        equipment_item_id: { type: graphql_1.GraphQLInt },
        material_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        service_date: { type: graphql_scalars_1.GraphQLDateTime },
        billable_service_price: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        billable_service_quantity: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        billable_service_total: { type: graphql_1.GraphQLInt },
        initial_grand_total: { type: graphql_1.GraphQLInt },
        grand_total: { type: graphql_1.GraphQLInt },
        media_urls: { type: graphql_1.GraphQLString },
        driver_instructions: { type: graphql_1.GraphQLString },
        alley_placement: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        someone_on_site: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        send_receipt: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        payment_method: { type: graphql_1.GraphQLString },
        credit_card_id: { type: graphql_1.GraphQLInt },
        purchase_order_id: { type: graphql_1.GraphQLInt },
        service_area_id: { type: graphql_1.GraphQLInt },
        created_at: { type: graphql_scalars_1.GraphQLDateTime },
        updated_at: { type: graphql_scalars_1.GraphQLDateTime },
    }),
});
exports.default = orderRequestType;
//# sourceMappingURL=type.js.map