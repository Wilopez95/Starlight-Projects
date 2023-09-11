import { RequestQueryParams } from '@root/api/base';

export type OrderRequestStoreSortType = 'serviceDate' | 'createdAt';

export type OrderRequestCount = {
  total: number;
};

export interface IRequestByIdOptions extends RequestQueryParams {
  id: number;
  businessUnitId: number;
}
