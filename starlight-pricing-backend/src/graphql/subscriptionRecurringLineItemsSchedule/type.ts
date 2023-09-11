import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';
import { AppDataSource } from '../../data-source';
import { Prices } from '../../database/entities/tenant/Prices';
import { ISubscriptionRecurringLineItemsScheduleResolver } from '../../Interfaces/SubscriptionRecurringLineItemsSchedule';
import priceType from '../prices/type';

const subscriptionsRecurringType: GraphQLObjectType = new GraphQLObjectType({
  name: 'subscriptionRecurringLineItemsSchedule',
  description: 'display every subscription Recurring Line Items Schedule on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    subscription_id: { type: new GraphQLNonNull(GraphQLInt) },
    subscription_recurring_line_item_id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    billable_line_item_id: { type: new GraphQLNonNull(GraphQLInt) },
    price_id: { type: new GraphQLNonNull(GraphQLInt) },
    billing_cycle: { type: new GraphQLNonNull(GraphQLString) },
    quantity: { type: GraphQLInt },
    override_price: { type: new GraphQLNonNull(GraphQLBoolean) },
    override_proration: { type: new GraphQLNonNull(GraphQLInt) },
    price: { type: new GraphQLNonNull(GraphQLInt) }, //show as decimal depending on locale on FE, at least 6 fractional digits
    overridden_price: { type: new GraphQLNonNull(GraphQLInt) }, //when override_price
    next_price: { type: GraphQLInt }, //show as decimal depending on locale on FE, at least 6 fractional digits
    amount: { type: GraphQLInt }, //show as decimal depending on locale on FE, at least 6 fractional digits
    prorated_amount: { type: GraphQLInt }, //show as decimal depending on locale on FE, at least 6 fractional digits
    overridden_prorated_amount: { type: GraphQLInt }, //show as decimal depending on locale on FE, at least 6 fractional digits
    total: { type: GraphQLInt }, //show as decimal depending on locale on FE, at least 6 fractional digits
    start_at: { type: new GraphQLNonNull(GraphQLString) },
    end_at: { type: GraphQLString },
    invoiced_at: { type: GraphQLString },
    paid_at: { type: GraphQLString },
    prices: {
      type: priceType,
      resolve: (price: ISubscriptionRecurringLineItemsScheduleResolver) => {
        return AppDataSource.manager.findOneBy(Prices, {
          id: price.price_id,
        });
      },
    },
  }),
});

export default subscriptionsRecurringType;
