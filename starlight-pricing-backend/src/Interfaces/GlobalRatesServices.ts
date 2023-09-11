import { IEntity } from './Entity';

export interface IGetGlobalRatesServicesData {
  businessUnitId?: number | null;
  businessLineId?: number | null;
  billableServiceId?: number | null;
  equipmentItemId?: number | null;
  materialId?: number | null;
}
export interface IGetGlobalRatesServices {
  data: IGetGlobalRatesServicesData;
}

export interface IGlobalRateService extends IEntity {
  price?: number;
  businessUnitId: string;
  businessLineId: string;
  billableServiceId: number;
  materialId?: number | null;
  equipmentItemId?: number;
}
