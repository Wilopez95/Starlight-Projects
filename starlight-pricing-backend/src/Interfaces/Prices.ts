import { Prices } from '../database/entities/tenant/Prices';

export interface IPricesResolver {
  price_group_id: number;
}

export interface IWherePrices extends Prices {
  price_group_id?: number | string | null;
  entity_type?: string | string | null;
}
