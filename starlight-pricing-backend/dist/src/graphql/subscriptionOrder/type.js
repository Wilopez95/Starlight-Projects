"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const data_source_1 = require("../../data-source");
const graphql_scalars_1 = require("graphql-scalars");
const type_1 = require("../prices/type");
const Prices_1 = require("../../database/entities/tenant/Prices");
const PriceGroupsHistorical_1 = require("../../database/entities/tenant/PriceGroupsHistorical");
const type_2 = require("../priceGroupHistorical/type");
let subscriptionOrderType = new graphql_1.GraphQLObjectType({
    name: "subscriptionOrder",
    description: "display every subscription order on the system",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        billed_at: { type: graphql_scalars_1.GraphQLDateTime },
        included: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        add_trip_charge: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        cancellation_reason: { type: graphql_1.GraphQLString },
        job_site_contact_id: { type: graphql_1.GraphQLInt },
        permit_id: { type: graphql_1.GraphQLInt },
        promo_id: { type: graphql_1.GraphQLInt },
        third_party_hauler_id: { type: graphql_1.GraphQLInt },
        early_pick: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        unlock_overrides: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        work_orders_count: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        status: { type: graphql_1.GraphQLString },
        call_on_way_phone_number: { type: graphql_1.GraphQLString },
        text_on_way_phone_number: { type: graphql_1.GraphQLString },
        alley_placement: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        to_roll: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        subscription_contact_id: { type: graphql_1.GraphQLInt },
        signature_required: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        can_reschedule: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        one_time: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        instructions_for_driver: { type: graphql_1.GraphQLString },
        job_site_note: { type: graphql_1.GraphQLString },
        onejob_site_contact_text_onlytime: {
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean),
        },
        best_time_to_come_from: { type: graphql_1.GraphQLString },
        best_time_to_come_to: { type: graphql_1.GraphQLString },
        someone_on_site: { type: graphql_1.GraphQLBoolean },
        high_priority: { type: graphql_1.GraphQLBoolean },
        has_comments: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        has_assigned_routes: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        started_at: { type: graphql_scalars_1.GraphQLDateTime },
        canceled_at: { type: graphql_scalars_1.GraphQLDateTime },
        completed_at: { type: graphql_scalars_1.GraphQLDateTime },
        po_required: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        permit_required: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        subscription_service_item_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        billable_service_id: { type: graphql_1.GraphQLInt },
        material_id: { type: graphql_1.GraphQLInt },
        global_rates_services_id: { type: graphql_1.GraphQLInt },
        custom_rates_group_services_id: { type: graphql_1.GraphQLInt },
        service_date: { type: new graphql_1.GraphQLNonNull(graphql_scalars_1.GraphQLDateTime) },
        price: { type: graphql_1.GraphQLInt },
        quantity: { type: graphql_1.GraphQLInt },
        grand_total: { type: graphql_1.GraphQLInt },
        service_day_of_week_required_by_customer: { type: graphql_1.GraphQLBoolean },
        assigned_route: { type: graphql_1.GraphQLString },
        billable_line_items_total: { type: graphql_1.GraphQLInt },
        cancellation_comment: { type: graphql_1.GraphQLString },
        override_credit_limit: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        invoiced_date: { type: graphql_scalars_1.GraphQLDateTime },
        arrived_at: { type: graphql_scalars_1.GraphQLDateTime },
        deleted_at: { type: graphql_scalars_1.GraphQLDateTime },
        custom_rates_group_id: { type: graphql_1.GraphQLInt },
        destination_job_site_id: { type: graphql_1.GraphQLInt },
        subscription_id: { type: graphql_1.GraphQLInt },
        sequence_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        purchase_order_id: { type: graphql_1.GraphQLInt },
        apply_surcharges: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        is_final_for_service: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        surcharges_total: { type: graphql_1.GraphQLInt },
        before_taxes_total: { type: graphql_1.GraphQLInt },
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
        price_group_historical_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        priceGroupHistoricalId: {
            type: type_2.default,
            resolve: (priceGroupsHistorical) => {
                return data_source_1.AppDataSource.manager.findOneBy(PriceGroupsHistorical_1.PriceGroupsHistorical, {
                    id: priceGroupsHistorical.price_group_historical_id,
                });
            },
        },
        created_at: { type: graphql_scalars_1.GraphQLDateTime },
        updated_at: { type: graphql_scalars_1.GraphQLDateTime },
        invoice_notes: { type: graphql_1.GraphQLString },
        uncompleted_comment: { type: graphql_1.GraphQLString },
        unapproved_comment: { type: graphql_1.GraphQLString },
        unfinalized_comment: { type: graphql_1.GraphQLString },
        dropped_equipment_item: { type: graphql_1.GraphQLString },
        picked_up_equipment_item: { type: graphql_1.GraphQLString },
        weight: { type: graphql_1.GraphQLInt },
        finish_work_order_date: { type: graphql_scalars_1.GraphQLDateTime },
        weight_unit: { type: graphql_1.GraphQLString },
    }),
});
exports.default = subscriptionOrderType;
//# sourceMappingURL=type.js.map