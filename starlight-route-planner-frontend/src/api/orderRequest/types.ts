import { RequestQueryParams } from '../base';

export type OrderRequestStoreCountResponse = {
  total: number;
};

export interface IOrderRequestParams extends RequestQueryParams {
  businessUnitId: number;
}
