import { IEntity } from './Entity';

export interface IGlobalRateSurcharge extends IEntity {
  surchargeId: number;
  materialId?: number;
  price?: number;
  businessUnitId: string;
  businessLineId: string;
}

export interface IGetGlobalRatesSurchargesData {
  businessUnitId: number;
  businessLineId: number;
}

export interface IGetGlobalRatesSurcharges {
  data: IGetGlobalRatesSurchargesData;
}
