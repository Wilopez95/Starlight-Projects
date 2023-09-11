import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { AppDataSource } from '../../data-source';
import { Prices } from '../../database/entities/tenant/Prices';
import { RecurrentOrderTemplate } from '../../database/entities/tenant/RecurrentOrderTemplates';
import { IRecurrentOrderTemplateLineItemsHistoricalResolver } from '../../Interfaces/RecurrentOrderTemplateLineItemsHistorical';
import priceType from '../prices/type';
import recurrentOrderTemplateType from '../recurrentOrderTemplate/type';

const recurrentOrderTemplateLineItemsHistoricalType: GraphQLObjectType = new GraphQLObjectType({
  name: 'recurrentOrderTemplateLineItemsHistorical',
  description: 'display every recurrent order template line items historical on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    original_id: { type: new GraphQLNonNull(GraphQLInt) },
    event_type: { type: GraphQLString },
    user_id: { type: new GraphQLNonNull(GraphQLString) },
    trace_id: { type: GraphQLString },
    created_at: { type: GraphQLDateTime },
    updated_at: { type: GraphQLDateTime },
    recurrent_order_template_id: { type: new GraphQLNonNull(GraphQLInt) },
    billable_line_item_id: { type: new GraphQLNonNull(GraphQLInt) },
    material_id: { type: GraphQLInt },
    global_rates_line_items_id: { type: new GraphQLNonNull(GraphQLInt) },
    custom_rates_group_line_items_id: { type: GraphQLInt },
    price: { type: new GraphQLNonNull(GraphQLInt) },
    quantity: { type: new GraphQLNonNull(GraphQLInt) },
    apply_surcharges: { type: new GraphQLNonNull(GraphQLBoolean) },
    price_id: { type: new GraphQLNonNull(GraphQLInt) },
    prices: {
      type: priceType,
      resolve: (price: IRecurrentOrderTemplateLineItemsHistoricalResolver) => {
        return AppDataSource.manager.findOneBy(Prices, {
          id: price.price_id,
        });
      },
    },
    recurrentOrderTemplateId: {
      type: recurrentOrderTemplateType,
      resolve: (recurrentOrder: IRecurrentOrderTemplateLineItemsHistoricalResolver) => {
        return AppDataSource.manager.findOneBy(RecurrentOrderTemplate, {
          id: recurrentOrder.recurrent_order_template_id,
        });
      },
    },
  }),
});

export default recurrentOrderTemplateLineItemsHistoricalType;
