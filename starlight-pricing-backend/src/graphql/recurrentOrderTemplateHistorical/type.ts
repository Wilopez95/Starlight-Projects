import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { AppDataSource } from '../../data-source';
import { PriceGroupsHistorical } from '../../database/entities/tenant/PriceGroupsHistorical';
import { Prices } from '../../database/entities/tenant/Prices';
import { IRecurrentOrderTemplateHistoricalResolver } from '../../Interfaces/RecurrentOrderTemplateHistorical';
import priceGroupType from '../priceGroup/type';
import priceType from '../prices/type';

const recurrentOrderTemplateHistoricalType: GraphQLObjectType = new GraphQLObjectType({
  name: 'recurrentOrderTemplateHistorical',
  description: 'display every recurrent order template historical on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    original_id: { type: new GraphQLNonNull(GraphQLInt) },
    event_type: { type: new GraphQLNonNull(GraphQLString) },
    user_id: { type: new GraphQLNonNull(GraphQLString) },
    trace_id: { type: new GraphQLNonNull(GraphQLString) },
    created_at: { type: GraphQLDateTime },
    updated_at: { type: GraphQLDateTime },
    business_line_id: { type: new GraphQLNonNull(GraphQLInt) },
    business_unit_id: { type: new GraphQLNonNull(GraphQLInt) },
    status: { type: new GraphQLNonNull(GraphQLString) },
    service_area_id: { type: GraphQLInt },
    job_site_id: { type: new GraphQLNonNull(GraphQLInt) },
    customer_id: { type: new GraphQLNonNull(GraphQLInt) },
    customer_job_site_id: { type: new GraphQLNonNull(GraphQLInt) },
    project_id: { type: GraphQLInt },
    third_party_hauler_id: { type: GraphQLInt },
    promo_id: { type: GraphQLInt },
    material_profile_id: { type: GraphQLInt },
    job_site_contact_id: { type: GraphQLInt },
    order_contact_id: { type: GraphQLInt },
    permit_id: { type: GraphQLInt },
    disposal_site_id: { type: GraphQLInt },
    custom_rates_group_id: { type: GraphQLInt },
    global_rates_services_id: { type: new GraphQLNonNull(GraphQLInt) },
    custom_rates_group_services_id: { type: GraphQLInt },
    billable_service_id: { type: GraphQLInt },
    material_id: { type: GraphQLInt },
    equipment_item_id: { type: GraphQLInt },
    billable_service_price: { type: new GraphQLNonNull(GraphQLInt) },
    billable_service_quantity: { type: new GraphQLNonNull(GraphQLInt) },
    billable_service_total: { type: new GraphQLNonNull(GraphQLInt) },
    billable_line_items_total: { type: new GraphQLNonNull(GraphQLInt) },
    thresholds_total: { type: new GraphQLNonNull(GraphQLInt) },
    frequency_type: { type: new GraphQLNonNull(GraphQLString) },
    frequency_period: { type: GraphQLInt },
    custom_frequency_type: { type: GraphQLString },
    frequency_days: { type: GraphQLInt },
    sync_date: { type: GraphQLDateTime },
    next_service_date: { type: GraphQLDateTime },
    unlock_overrides: { type: new GraphQLNonNull(GraphQLBoolean) },
    before_taxes_total: { type: new GraphQLNonNull(GraphQLInt) },
    grand_total: { type: new GraphQLNonNull(GraphQLInt) },
    start_date: { type: GraphQLDateTime },
    end_date: { type: GraphQLDateTime },
    job_site_note: { type: GraphQLString },
    call_on_way_phone_number: { type: GraphQLString },
    text_on_way_phone_number: { type: GraphQLString },
    call_on_way_phone_number_id: { type: GraphQLInt },
    text_on_way_phone_number_id: { type: GraphQLInt },
    driver_instructions: { type: GraphQLString },
    best_time_to_come_from: { type: GraphQLString },
    best_time_to_come_to: { type: GraphQLString },
    someone_on_site: { type: new GraphQLNonNull(GraphQLBoolean) },
    to_roll: { type: new GraphQLNonNull(GraphQLBoolean) },
    high_priority: { type: new GraphQLNonNull(GraphQLBoolean) },
    early_pick: { type: new GraphQLNonNull(GraphQLBoolean) },
    invoice_notes: { type: GraphQLString },
    csr_email: { type: new GraphQLNonNull(GraphQLString) },
    alley_placement: { type: new GraphQLNonNull(GraphQLBoolean) },
    cab_over: { type: new GraphQLNonNull(GraphQLBoolean) },
    signature_required: { type: new GraphQLNonNull(GraphQLBoolean) },
    payment_method: { type: new GraphQLNonNull(GraphQLString) },
    notify_day_before: { type: GraphQLString },
    apply_surcharges: { type: new GraphQLNonNull(GraphQLBoolean) },
    billable_service_apply_surcharges: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    surcharges_total: { type: GraphQLInt },
    commercial_taxes_used: { type: new GraphQLNonNull(GraphQLBoolean) },
    purchase_order_id: { type: GraphQLInt },
    on_hold_email_sent: { type: new GraphQLNonNull(GraphQLBoolean) },
    on_hold_notify_sales_rep: { type: new GraphQLNonNull(GraphQLBoolean) },
    on_hold_notify_main_contact: { type: new GraphQLNonNull(GraphQLBoolean) },

    // refactor starts here
    price_group_id: { type: new GraphQLNonNull(GraphQLInt) },
    price_id: { type: new GraphQLNonNull(GraphQLInt) },
    // end
    last_failure_date: { type: GraphQLDateTime },
    price_group: {
      type: priceGroupType,
      resolve: (data: IRecurrentOrderTemplateHistoricalResolver) => {
        return AppDataSource.manager.findOneBy(PriceGroupsHistorical, {
          id: data.price_group_id,
        });
      },
    },
    prices: {
      type: priceType,
      resolve: (data: IRecurrentOrderTemplateHistoricalResolver) => {
        return AppDataSource.manager.findOneBy(Prices, {
          id: data.price_id,
        });
      },
    },
  }),
});

export default recurrentOrderTemplateHistoricalType;
