import { RecurrentOrderTemplateLineItemsHistorical } from '../database/entities/tenant/RecurrentOrderTemplateLineItemsHistorical';

export interface IRecurrentOrderTemplateLineItemsHistoricalResolver {
  price_id: number;
  recurrent_order_template_id: number;
}

export interface IWhereRecurrentOrderTemplateLineItemsHistorical
  extends RecurrentOrderTemplateLineItemsHistorical {
  recurrent_order_template_id?: number | null;
  price_id?: number | null;
}
