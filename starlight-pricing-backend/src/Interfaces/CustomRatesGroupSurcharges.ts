import { CustomRatesGroupSurcharges } from '../database/entities/tenant/CustomRatesGroupSurcharges';
import { IEntity } from './Entity';
import { IWhere } from './GeneralsFilter';

export interface IUpsertManyCustomRatesGroupSurcharges {
  where: IWhere;
  oldData: CustomRatesGroupSurcharges[];
}

export type TypePickCustomRatesGroupSurcharges = Pick<CustomRatesGroupSurcharges, 'id'>;

export interface ICustomRateSurcharge extends IEntity {
  customRatesGroupId: number;
  surchargeId: number;
  materialId: number | null;
  price: number;
  businessUnitId: string;
  businessLineId: string;
}

export interface IGetCustomGroupRatesSurchargesParams {
  businessUnitId: number;
  businessLineId: number;
  customRatesGroupId: number;
}

export interface IGetCustomGroupRatesSurchargesData {
  data: IGetCustomGroupRatesSurchargesParams;
}
