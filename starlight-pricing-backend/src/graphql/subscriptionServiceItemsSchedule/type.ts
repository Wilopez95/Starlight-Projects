import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { AppDataSource } from '../../data-source';
import { Prices } from '../../database/entities/tenant/Prices';
import { ISubscriptionServiceItemsScheduleResolver } from '../../Interfaces/SubscriptionServiceItemsSchedule';
import priceType from '../prices/type';

const subscriptionsServiceType: GraphQLObjectType = new GraphQLObjectType({
  name: 'subscriptionService',
  description: 'display every subscription service items schedule on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    subscription_id: { type: new GraphQLNonNull(GraphQLInt) },
    subscription_service_item_id: { type: new GraphQLNonNull(GraphQLInt) },
    billable_service_id: { type: new GraphQLNonNull(GraphQLInt) },
    material_id: { type: GraphQLInt },
    price_id: { type: new GraphQLNonNull(GraphQLInt) },
    billing_cycle: { type: new GraphQLNonNull(GraphQLString) },
    frequency_id: { type: GraphQLInt },
    service_days_of_week: { type: GraphQLJSON },
    quantity: { type: GraphQLInt },
    override_price: { type: new GraphQLNonNull(GraphQLBoolean) },
    override_proration: { type: new GraphQLNonNull(GraphQLBoolean) },
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
    created_at: { type: GraphQLString },
    prices: {
      type: priceType,
      resolve: (price: ISubscriptionServiceItemsScheduleResolver) => {
        return AppDataSource.manager.findOneBy(Prices, {
          id: price.price_id,
        });
      },
    },
  }),
});

export default subscriptionsServiceType;
