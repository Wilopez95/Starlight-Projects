import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { AppDataSource } from '../../data-source';
import priceType from '../prices/type';
import { Prices } from '../../database/entities/tenant/Prices';
import { PriceGroupsHistorical } from '../../database/entities/tenant/PriceGroupsHistorical';
import priceGroupHistoricalType from '../priceGroupHistorical/type';
import { ISubscriptionOrdersResolver } from '../../Interfaces/SubscriptionOrders';

const subscriptionOrderType: GraphQLObjectType = new GraphQLObjectType({
  name: 'subscriptionOrder',
  description: 'display every subscription order on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    billed_at: { type: GraphQLDateTime },
    included: { type: new GraphQLNonNull(GraphQLBoolean) },
    add_trip_charge: { type: new GraphQLNonNull(GraphQLBoolean) },
    cancellation_reason: { type: GraphQLString },
    job_site_contact_id: { type: GraphQLInt },
    permit_id: { type: GraphQLInt },
    promo_id: { type: GraphQLInt },
    third_party_hauler_id: { type: GraphQLInt },
    early_pick: { type: new GraphQLNonNull(GraphQLBoolean) },
    unlock_overrides: { type: new GraphQLNonNull(GraphQLBoolean) },
    work_orders_count: { type: new GraphQLNonNull(GraphQLInt) },
    status: { type: GraphQLString },
    call_on_way_phone_number: { type: GraphQLString },
    text_on_way_phone_number: { type: GraphQLString },
    alley_placement: { type: new GraphQLNonNull(GraphQLBoolean) },
    to_roll: { type: new GraphQLNonNull(GraphQLBoolean) },
    subscription_contact_id: { type: GraphQLInt },
    signature_required: { type: new GraphQLNonNull(GraphQLBoolean) },
    can_reschedule: { type: new GraphQLNonNull(GraphQLBoolean) },
    one_time: { type: new GraphQLNonNull(GraphQLBoolean) },
    instructions_for_driver: { type: GraphQLString },
    job_site_note: { type: GraphQLString },
    onejob_site_contact_text_onlytime: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    best_time_to_come_from: { type: GraphQLString },
    best_time_to_come_to: { type: GraphQLString },
    someone_on_site: { type: GraphQLBoolean },
    high_priority: { type: GraphQLBoolean },
    has_comments: { type: new GraphQLNonNull(GraphQLBoolean) },
    has_assigned_routes: { type: new GraphQLNonNull(GraphQLBoolean) },
    started_at: { type: GraphQLDateTime },
    canceled_at: { type: GraphQLDateTime },
    completed_at: { type: GraphQLDateTime },
    po_required: { type: new GraphQLNonNull(GraphQLBoolean) },
    permit_required: { type: new GraphQLNonNull(GraphQLBoolean) },
    subscription_service_item_id: { type: new GraphQLNonNull(GraphQLInt) },
    billable_service_id: { type: GraphQLInt },
    material_id: { type: GraphQLInt },
    global_rates_services_id: { type: GraphQLInt },
    custom_rates_group_services_id: { type: GraphQLInt },
    service_date: { type: new GraphQLNonNull(GraphQLDateTime) },
    price: { type: GraphQLInt },
    quantity: { type: GraphQLInt },
    grand_total: { type: GraphQLInt },
    service_day_of_week_required_by_customer: { type: GraphQLBoolean },
    assigned_route: { type: GraphQLString },
    billable_line_items_total: { type: GraphQLInt },
    cancellation_comment: { type: GraphQLString },
    override_credit_limit: { type: new GraphQLNonNull(GraphQLBoolean) },
    invoiced_date: { type: GraphQLDateTime },
    arrived_at: { type: GraphQLDateTime },
    deleted_at: { type: GraphQLDateTime },
    custom_rates_group_id: { type: GraphQLInt },
    destination_job_site_id: { type: GraphQLInt },
    subscription_id: { type: GraphQLInt },
    sequence_id: { type: new GraphQLNonNull(GraphQLString) },
    purchase_order_id: { type: GraphQLInt },
    apply_surcharges: { type: new GraphQLNonNull(GraphQLBoolean) },
    is_final_for_service: { type: new GraphQLNonNull(GraphQLBoolean) },
    surcharges_total: { type: GraphQLInt },
    before_taxes_total: { type: GraphQLInt },
    invoiced_at: { type: GraphQLDateTime },
    paid_at: { type: GraphQLDateTime },
    price_id: { type: new GraphQLNonNull(GraphQLInt) },
    priceId: {
      type: priceType,
      resolve: (price: ISubscriptionOrdersResolver) => {
        return AppDataSource.manager.findOneBy(Prices, {
          id: price.price_id,
        });
      },
    },
    price_group_historical_id: { type: new GraphQLNonNull(GraphQLInt) },
    priceGroupHistoricalId: {
      type: priceGroupHistoricalType,
      resolve: (priceGroupsHistorical: ISubscriptionOrdersResolver) => {
        return AppDataSource.manager.findOneBy(PriceGroupsHistorical, {
          id: priceGroupsHistorical.price_group_historical_id,
        });
      },
    },
    created_at: { type: GraphQLDateTime },
    updated_at: { type: GraphQLDateTime },
    invoice_notes: { type: GraphQLString },
    uncompleted_comment: { type: GraphQLString },
    unapproved_comment: { type: GraphQLString },
    unfinalized_comment: { type: GraphQLString },
    dropped_equipment_item: { type: GraphQLString },
    picked_up_equipment_item: { type: GraphQLString },
    weight: { type: GraphQLInt },
    finish_work_order_date: { type: GraphQLDateTime },
    weight_unit: { type: GraphQLString },
  }),
});

export default subscriptionOrderType;
