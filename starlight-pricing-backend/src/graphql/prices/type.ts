import { GraphQLObjectType, GraphQLNonNull, GraphQLInt, GraphQLString } from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import priceGroupType from '../priceGroup/type';
import { AppDataSource } from '../../data-source';
import { PriceGroups } from '../../database/entities/tenant/PriceGroups';
import { IPricesResolver } from '../../Interfaces/Prices';

const priceType: GraphQLObjectType = new GraphQLObjectType({
  name: 'price',
  description: 'display every price on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    price_group_id: { type: new GraphQLNonNull(GraphQLInt) },
    entity_type: { type: new GraphQLNonNull(GraphQLString) },
    billable_service_id: { type: GraphQLInt },
    billable_line_item_id: { type: GraphQLInt },
    equipment_item_id: { type: GraphQLInt },
    material_id: { type: GraphQLInt },
    threshold_id: { type: GraphQLInt },
    surcharge_id: { type: GraphQLInt },
    billing_cycle: { type: GraphQLString },
    frequency_id: { type: GraphQLInt },
    price: { type: new GraphQLNonNull(GraphQLInt) },
    next_price: { type: GraphQLInt },
    limit: { type: GraphQLInt },
    start_at: { type: new GraphQLNonNull(GraphQLDateTime) },
    end_at: { type: GraphQLDateTime },
    user_id: { type: new GraphQLNonNull(GraphQLString) },
    created_at: { type: GraphQLDateTime },
    trace_id: { type: new GraphQLNonNull(GraphQLString) },
    price_group: {
      type: priceGroupType,
      resolve: (price: IPricesResolver) => {
        return AppDataSource.manager.findOneBy(PriceGroups, {
          id: price.price_group_id,
        });
      },
    },
  }),
});

export default priceType;
