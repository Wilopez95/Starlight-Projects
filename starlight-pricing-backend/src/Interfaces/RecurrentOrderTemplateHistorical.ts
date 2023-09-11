import { RecurrentOrderTemplateHistorical } from '../database/entities/tenant/RecurrentOrderTemplatesHistorical';

export interface IRecurrentOrderTemplateHistoricalResolver {
  price_group_id: number;
  price_id: number;
}

export interface IWhereRecurrentOrderTemplateHistorical extends RecurrentOrderTemplateHistorical {
  business_line_id?: number | null;
  business_unit_id?: number | null;
  price_group_id?: number | null;
  price_id?: number | null;
}
