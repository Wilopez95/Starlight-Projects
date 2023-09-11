import { GraphQLObjectType, GraphQLNonNull, GraphQLInt, GraphQLBoolean } from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { AppDataSource } from '../../data-source';
import { Prices } from '../../database/entities/tenant/Prices';
import { RecurrentOrderTemplate } from '../../database/entities/tenant/RecurrentOrderTemplates';
import { IRecurrentOrderTemplateLineItemsResolver } from '../../Interfaces/RecurrentOrderTemplateLineItems';
import priceType from '../prices/type';
import recurrentOrderTemplateType from '../recurrentOrderTemplate/type';

const recurrentOrderTemplateLineItemsType: GraphQLObjectType = new GraphQLObjectType({
  name: 'recurrentOrderTemplateLineItems',
  description: 'display every recurrent order template line items on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    recurrent_order_template_id: { type: new GraphQLNonNull(GraphQLInt) },
    billable_line_item_id: { type: new GraphQLNonNull(GraphQLInt) },
    material_id: { type: GraphQLInt },
    global_rates_line_items_id: { type: new GraphQLNonNull(GraphQLInt) },
    custom_rates_group_line_items_id: { type: GraphQLInt },
    price: { type: new GraphQLNonNull(GraphQLInt) },
    quantity: { type: new GraphQLNonNull(GraphQLInt) },
    apply_surcharges: { type: new GraphQLNonNull(GraphQLBoolean) },
    price_id: { type: new GraphQLNonNull(GraphQLInt) },
    created_at: { type: GraphQLDateTime },
    updated_at: { type: GraphQLDateTime },
    prices: {
      type: priceType,
      resolve: (price: IRecurrentOrderTemplateLineItemsResolver) => {
        return AppDataSource.manager.findOneBy(Prices, {
          id: price.price_id,
        });
      },
    },
    recurrentOrderTemplateId: {
      type: recurrentOrderTemplateType,
      resolve: (recurrentOrder: IRecurrentOrderTemplateLineItemsResolver) => {
        return AppDataSource.manager.findOneBy(RecurrentOrderTemplate, {
          id: recurrentOrder.recurrent_order_template_id,
        });
      },
    },
  }),
});

export default recurrentOrderTemplateLineItemsType;
