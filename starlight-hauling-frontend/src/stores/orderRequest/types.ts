import { RequestQueryParams } from '@root/api/base';

export type OrderRequestStoreSortType = 'service' | 'jobSite' | 'customer' | 'total' | 'id';

export type OrderRequestCount = {
  total: number;
};

export interface IRequestByIdOptions extends RequestQueryParams {
  id: number;
  businessUnitId: string;
}
