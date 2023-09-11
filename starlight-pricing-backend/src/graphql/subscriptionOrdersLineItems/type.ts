import { GraphQLObjectType, GraphQLNonNull, GraphQLInt, GraphQLBoolean } from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { AppDataSource } from '../../data-source';
import priceType from '../prices/type';
import { Prices } from '../../database/entities/tenant/Prices';
import subscriptionOrderType from '../subscriptionOrder/type';
import { SubscriptionOrders } from '../../database/entities/tenant/SubscriptionOrders';
import { ISubscriptionOrdersLineItemsResolver } from '../../Interfaces/SubscriptionOrdersLineItems';

const subscriptionOrdersLineItemsType: GraphQLObjectType = new GraphQLObjectType({
  name: 'subscriptionOrdersLineItems',
  description: 'display every subscription orders line items on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    subscription_work_order_id: { type: GraphQLInt },
    billable_line_item_id: { type: new GraphQLNonNull(GraphQLInt) },
    global_rates_line_items_id: { type: new GraphQLNonNull(GraphQLInt) },
    custom_rates_group_line_items_id: { type: new GraphQLNonNull(GraphQLInt) },
    price: { type: GraphQLInt },
    quantity: { type: GraphQLInt },
    material_id: { type: GraphQLInt },
    work_order_line_item_id: { type: GraphQLInt },
    unlock_overrides: { type: new GraphQLNonNull(GraphQLBoolean) },
    invoiced_at: { type: GraphQLDateTime },
    paid_at: { type: GraphQLDateTime },
    price_id: { type: new GraphQLNonNull(GraphQLInt) },
    priceId: {
      type: priceType,
      resolve: (price: ISubscriptionOrdersLineItemsResolver) => {
        return AppDataSource.manager.findOneBy(Prices, {
          id: price.price_id,
        });
      },
    },
    created_at: { type: GraphQLDateTime },
    updated_at: { type: GraphQLDateTime },
    subscription_order_id: { type: new GraphQLNonNull(GraphQLInt) },
    subscriptionOrderId: {
      type: subscriptionOrderType,
      resolve: (subscriptionOrder: ISubscriptionOrdersLineItemsResolver) => {
        return AppDataSource.manager.findOneBy(SubscriptionOrders, {
          id: subscriptionOrder.subscription_order_id,
        });
      },
    },
  }),
});

export default subscriptionOrdersLineItemsType;
