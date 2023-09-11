import { AppliedFilterState } from '@root/core/common/TableTools/TableFilter';

export type InvoiceSortType =
  | 'ID'
  | 'BALANCE'
  | 'CREATED_AT'
  | 'DUE_DATE'
  | 'TOTAL'
  | 'CUSTOMER_NAME'
  | 'CUSTOMER_TYPE';

export type CustomerRequestParams = {
  customerId: number;
  jobsiteId?: number;
  filters?: AppliedFilterState;
  query?: string;
};

export type InvoiceRequestParams = {
  filters?: AppliedFilterState;
  query?: string;
};
