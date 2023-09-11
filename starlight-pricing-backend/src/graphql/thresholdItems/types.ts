import { GraphQLObjectType, GraphQLNonNull, GraphQLInt, GraphQLBoolean } from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { AppDataSource } from '../../data-source';
import { Orders } from '../../database/entities/tenant/Orders';
import { Prices } from '../../database/entities/tenant/Prices';
import { IThresholdItemsResolver } from '../../Interfaces/ThresholdItems';
import orderType from '../orders/types';
import priceType from '../prices/type';

const thresholdItemsType: GraphQLObjectType = new GraphQLObjectType({
  name: 'thresholdItems',
  description: 'display every thresholdItems on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    order_id: { type: new GraphQLNonNull(GraphQLInt) },
    orderId: {
      type: orderType,
      resolve: (orders: IThresholdItemsResolver) => {
        return AppDataSource.manager.findOneBy(Orders, {
          id: orders.order_id,
        });
      },
    },
    threshold_id: { type: new GraphQLNonNull(GraphQLInt) },
    global_rates_thresholds_id: { type: GraphQLInt },
    price: { type: new GraphQLNonNull(GraphQLInt) },
    quantity: { type: GraphQLInt },
    price_id: { type: new GraphQLNonNull(GraphQLInt) },
    priceId: {
      type: priceType,
      resolve: (price: IThresholdItemsResolver) => {
        return AppDataSource.manager.findOneBy(Prices, {
          id: price.price_id,
        });
      },
    },
    invoiced_at: { type: GraphQLDateTime },
    paid_at: { type: GraphQLDateTime },
    price_to_display: { type: GraphQLInt },
    created_at: { type: GraphQLDateTime },
    updated_at: { type: GraphQLDateTime },
    apply_surcharges: { type: new GraphQLNonNull(GraphQLBoolean) },
  }),
});
export default thresholdItemsType;
