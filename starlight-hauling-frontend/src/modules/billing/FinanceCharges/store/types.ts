import { type AppliedFilterState } from '../../../../common/TableTools/TableFilter';

export type FinanceChargeSortType =
  | 'ID'
  | 'STATUS'
  | 'CREATED_AT'
  | 'TOTAL'
  | 'REMAINING_BALANCE'
  | 'CUSTOMER'
  | 'CUSTOMER_TYPE';

export type RequestParams = {
  businessUnitId: number;
  filters?: AppliedFilterState;
  query?: string;
};

export type CustomerRequestParams = {
  customerId: number;
  filters?: AppliedFilterState;
  query?: string;
};
