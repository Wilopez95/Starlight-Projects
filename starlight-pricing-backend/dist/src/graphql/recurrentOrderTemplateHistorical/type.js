"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_scalars_1 = require("graphql-scalars");
const data_source_1 = require("../../data-source");
const PriceGroupsHistorical_1 = require("../../database/entities/tenant/PriceGroupsHistorical");
const Prices_1 = require("../../database/entities/tenant/Prices");
const type_1 = require("../priceGroup/type");
const type_2 = require("../prices/type");
let recurrentOrderTemplateHistoricalType = new graphql_1.GraphQLObjectType({
    name: "recurrentOrderTemplateHistorical",
    description: "display every recurrent order template historical on the system",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        original_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        event_type: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        user_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        trace_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        created_at: { type: graphql_scalars_1.GraphQLDateTime },
        updated_at: { type: graphql_scalars_1.GraphQLDateTime },
        business_line_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        business_unit_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        status: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        service_area_id: { type: graphql_1.GraphQLInt },
        job_site_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        customer_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        customer_job_site_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        project_id: { type: graphql_1.GraphQLInt },
        third_party_hauler_id: { type: graphql_1.GraphQLInt },
        promo_id: { type: graphql_1.GraphQLInt },
        material_profile_id: { type: graphql_1.GraphQLInt },
        job_site_contact_id: { type: graphql_1.GraphQLInt },
        order_contact_id: { type: graphql_1.GraphQLInt },
        permit_id: { type: graphql_1.GraphQLInt },
        disposal_site_id: { type: graphql_1.GraphQLInt },
        custom_rates_group_id: { type: graphql_1.GraphQLInt },
        global_rates_services_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        custom_rates_group_services_id: { type: graphql_1.GraphQLInt },
        billable_service_id: { type: graphql_1.GraphQLInt },
        material_id: { type: graphql_1.GraphQLInt },
        equipment_item_id: { type: graphql_1.GraphQLInt },
        billable_service_price: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        billable_service_quantity: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        billable_service_total: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        billable_line_items_total: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        thresholds_total: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        frequency_type: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        frequency_period: { type: graphql_1.GraphQLInt },
        custom_frequency_type: { type: graphql_1.GraphQLString },
        frequency_days: { type: graphql_1.GraphQLInt },
        sync_date: { type: graphql_scalars_1.GraphQLDateTime },
        next_service_date: { type: graphql_scalars_1.GraphQLDateTime },
        unlock_overrides: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        before_taxes_total: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        grand_total: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        start_date: { type: graphql_scalars_1.GraphQLDateTime },
        end_date: { type: graphql_scalars_1.GraphQLDateTime },
        job_site_note: { type: graphql_1.GraphQLString },
        call_on_way_phone_number: { type: graphql_1.GraphQLString },
        text_on_way_phone_number: { type: graphql_1.GraphQLString },
        call_on_way_phone_number_id: { type: graphql_1.GraphQLInt },
        text_on_way_phone_number_id: { type: graphql_1.GraphQLInt },
        driver_instructions: { type: graphql_1.GraphQLString },
        best_time_to_come_from: { type: graphql_1.GraphQLString },
        best_time_to_come_to: { type: graphql_1.GraphQLString },
        someone_on_site: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        to_roll: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        high_priority: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        early_pick: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        invoice_notes: { type: graphql_1.GraphQLString },
        csr_email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        alley_placement: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        cab_over: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        signature_required: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        payment_method: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        notify_day_before: { type: graphql_1.GraphQLString },
        apply_surcharges: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        billable_service_apply_surcharges: {
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean),
        },
        surcharges_total: { type: graphql_1.GraphQLInt },
        commercial_taxes_used: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        purchase_order_id: { type: graphql_1.GraphQLInt },
        on_hold_email_sent: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        on_hold_notify_sales_rep: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        on_hold_notify_main_contact: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean) },
        // refactor starts here
        price_group_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        price_id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        // end
        last_failure_date: { type: graphql_scalars_1.GraphQLDateTime },
        price_group: {
            type: type_1.default,
            resolve: (price) => {
                return data_source_1.AppDataSource.manager.findOneBy(PriceGroupsHistorical_1.PriceGroupsHistorical, {
                    id: price.price_group_id,
                });
            },
        },
        prices: {
            type: type_2.default,
            resolve: (price) => {
                return data_source_1.AppDataSource.manager.findOneBy(Prices_1.Prices, {
                    id: price.price_id,
                });
            },
        },
    }),
});
exports.default = recurrentOrderTemplateHistoricalType;
//# sourceMappingURL=type.js.map