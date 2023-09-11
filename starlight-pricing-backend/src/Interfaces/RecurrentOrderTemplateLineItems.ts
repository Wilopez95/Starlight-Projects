import { RecurrentOrderTemplateLineItems } from '../database/entities/tenant/RecurrentOrderTemplateLineItems';

export interface IRecurrentOrderTemplateLineItemsResolver {
  recurrent_order_template_id: number;
  price_id: number;
}
export interface IWhereRecurrentOrderTemplateLineItems extends RecurrentOrderTemplateLineItems {
  recurrent_order_template_id?: number | null;
  price_id?: number | null;
}
