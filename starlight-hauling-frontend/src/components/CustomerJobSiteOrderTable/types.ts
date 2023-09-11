import { InitQueryFuncType } from '@starlightpro/recycling/hooks/useAdditionalOrderData';

export interface IOrderTable {
  basePath: string;
  onRequest(fetchAdditionalOrderData?: InitQueryFuncType): void;
}

export interface IOrdersPageParams {
  jobSiteId: string;
  customerId: string;
  id?: string;
}

export interface IOrderInformation {
  recyclingWONumber?: string | null;
}
