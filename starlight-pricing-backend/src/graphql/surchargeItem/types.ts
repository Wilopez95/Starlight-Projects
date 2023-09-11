import { GraphQLObjectType, GraphQLNonNull, GraphQLInt } from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { AppDataSource } from '../../data-source';
import { LineItems } from '../../database/entities/tenant/LineItems';
import { Orders } from '../../database/entities/tenant/Orders';
import { Prices } from '../../database/entities/tenant/Prices';
import { ThresholdItems } from '../../database/entities/tenant/ThresholdItems';
import { ISurchargeItemResolver } from '../../Interfaces/SurchargeItem';
import lineItemsType from '../lineItems/types';
import orderType from '../orders/types';
import priceType from '../prices/type';
import thresholdItemsType from '../thresholdItems/types';

const surchargeItemType: GraphQLObjectType = new GraphQLObjectType({
  name: 'surchargeItem',
  description: 'display every surchargeItem on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    order_id: { type: new GraphQLNonNull(GraphQLInt) },
    orderId: {
      type: orderType,
      resolve: (orders: ISurchargeItemResolver) => {
        return AppDataSource.manager.findOneBy(Orders, {
          id: orders.order_id,
        });
      },
    },
    surcharge_id: { type: new GraphQLNonNull(GraphQLInt) },
    billable_line_item_id: { type: GraphQLInt },
    billable_service_id: { type: GraphQLInt },
    threshold_id: { type: GraphQLInt },
    material_id: { type: GraphQLInt },
    global_rates_surcharges_id: { type: GraphQLInt },
    custom_rates_group_surcharges_id: { type: GraphQLInt },
    amount: { type: GraphQLInt },
    quantity: { type: GraphQLInt },
    price_id: { type: new GraphQLNonNull(GraphQLInt) },
    priceId: {
      type: priceType,
      resolve: (price: ISurchargeItemResolver) => {
        return AppDataSource.manager.findOneBy(Prices, {
          id: price.price_id,
        });
      },
    },
    invoiced_at: { type: GraphQLDateTime },
    paid_at: { type: GraphQLDateTime },
    amount_to_display: { type: new GraphQLNonNull(GraphQLInt) },
    created_at: { type: GraphQLDateTime },
    updated_at: { type: GraphQLDateTime },
    line_item_id: { type: GraphQLInt }, // pendiente
    lineItemId: {
      type: lineItemsType,
      resolve: (lineItem: ISurchargeItemResolver) => {
        return AppDataSource.manager.findOneBy(LineItems, {
          id: lineItem.line_item_id,
        });
      },
    },
    threshold_item_id: { type: GraphQLInt },
    thresholdItemId: {
      type: thresholdItemsType,
      resolve: (thresholdItem: ISurchargeItemResolver) => {
        return AppDataSource.manager.findOneBy(ThresholdItems, {
          id: thresholdItem.threshold_item_id,
        });
      },
    },
  }),
});

export default surchargeItemType;
