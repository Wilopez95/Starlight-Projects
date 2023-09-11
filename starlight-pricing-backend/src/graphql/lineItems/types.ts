import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { AppDataSource } from '../../data-source';
import { Orders } from '../../database/entities/tenant/Orders';
import { Prices } from '../../database/entities/tenant/Prices';
import { ILineItemsResolver } from '../../Interfaces/LineItems';
import orderType from '../orders/types';
import priceType from '../prices/type';

const lineItemsType: GraphQLObjectType = new GraphQLObjectType({
  name: 'lineItems',
  description: 'display every lineItems on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    order_id: { type: new GraphQLNonNull(GraphQLInt) },
    orderId: {
      type: orderType,
      resolve: (orders: ILineItemsResolver) => {
        return AppDataSource.manager.findOneBy(Orders, {
          id: orders.order_id,
        });
      },
    },
    billable_line_item_id: { type: new GraphQLNonNull(GraphQLInt) },
    material_id: { type: GraphQLInt },
    global_rates_line_items_id: { type: GraphQLInt },
    custom_rates_group_line_items_id: { type: GraphQLInt },
    price: { type: new GraphQLNonNull(GraphQLInt) },
    quantity: { type: new GraphQLNonNull(GraphQLInt) },
    manifest_number: { type: GraphQLString },
    landfill_operation: { type: new GraphQLNonNull(GraphQLBoolean) },
    price_id: { type: new GraphQLNonNull(GraphQLInt) },
    priceId: {
      type: priceType,
      resolve: (price: ILineItemsResolver) => {
        return AppDataSource.manager.findOneBy(Prices, {
          id: price.price_id,
        });
      },
    },
    override_price: { type: new GraphQLNonNull(GraphQLBoolean) },
    overridden_price: { type: GraphQLInt },
    invoiced_at: { type: GraphQLDateTime },
    paid_at: { type: GraphQLDateTime },
    price_to_display: { type: GraphQLInt },
    created_at: { type: GraphQLDateTime },
    updated_at: { type: GraphQLDateTime },
    apply_surcharges: { type: new GraphQLNonNull(GraphQLBoolean) },
  }),
});

export default lineItemsType;
