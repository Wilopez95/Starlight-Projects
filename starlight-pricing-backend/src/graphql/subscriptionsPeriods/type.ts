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
import { ISubscriptionsPeriodsResolver } from '../../Interfaces/SubscriptionsPeriods';
import priceGroupHistoricalType from '../priceGroupHistorical/type';

const subscriptionsPeriodsType: GraphQLObjectType = new GraphQLObjectType({
  name: 'subscriptionPeriods',
  description: 'display every subscription on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    subscription_id: { type: new GraphQLNonNull(GraphQLInt) },
    price_group_historical_id: { type: new GraphQLNonNull(GraphQLInt) },
    status: { type: new GraphQLNonNull(GraphQLString) },
    billing_cycle: { type: new GraphQLNonNull(GraphQLString) },
    billing_type: { type: new GraphQLNonNull(GraphQLString) },
    override_proration: { type: GraphQLBoolean },
    recurring_services_amount: { type: GraphQLInt },
    recurring_services_prorated_amount: { type: GraphQLInt },
    recurring_services_overridden_prorated_amount: { type: GraphQLInt },
    recurring_services_total: { type: GraphQLInt },
    recurring_line_items_amount: { type: GraphQLInt },
    recurring_line_items_overridden_amount: { type: GraphQLInt },
    recurring_line_items_total: { type: GraphQLInt },
    recurring_line_items_overridden_total: { type: GraphQLInt },
    recurring_amount: { type: GraphQLInt },
    recurring_overridden_amount: { type: GraphQLInt },
    recurring_total: { type: GraphQLInt },
    recurring_overridden_total: { type: GraphQLInt },
    one_time_amount: { type: GraphQLInt },
    one_time_overridden_amount: { type: GraphQLInt },
    one_time_total: { type: GraphQLInt },
    one_time_overridden_total: { type: GraphQLInt },
    before_taxes_grand_total: { type: GraphQLInt },
    before_taxes_overridden_grand_total: { type: GraphQLInt },
    grand_total: { type: GraphQLInt },
    overridden_grand_total: { type: GraphQLInt },
    next_grand_total: { type: GraphQLInt },
    start_at: { type: new GraphQLNonNull(GraphQLDateTime) },
    end_at: { type: GraphQLDateTime },
    invoiced_at: { type: GraphQLDateTime },
    paid_at: { type: GraphQLDateTime },
    created_at: { type: GraphQLDateTime },
    price_group_historical: {
      type: priceGroupHistoricalType,
      resolve: (price: ISubscriptionsPeriodsResolver) => {
        return AppDataSource.manager.findOneBy(PriceGroupsHistorical, {
          id: price.price_group_id,
        });
      },
    },
  }),
});

export default subscriptionsPeriodsType;
