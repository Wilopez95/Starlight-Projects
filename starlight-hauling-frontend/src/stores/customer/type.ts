import { type AppliedFilterState } from '@root/common/TableTools/TableFilter';

export type CustomerRequestOptions = Record<string, unknown>;

export type CustomerStoreSortType =
  | 'id'
  | 'balance'
  | 'name'
  | 'status'
  | 'group'
  | 'owner'
  | 'contactPerson';

export type GetCountOptions = {
  businessUnitId: string | number;
  filterData?: AppliedFilterState;
  query?: string;
};

export interface ICustomerBalances {
  balance?: number;
  creditLimit?: number;
  nonInvoicedTotal?: number;
  prepaidOnAccount?: number;
  prepaidDeposits?: number;
  paymentDue?: number;
  availableCredit?: number;
}

export interface CustomerRequestParams {
  businessUnitId?: string;
  customerGroupId?: string;
  filterData?: AppliedFilterState;
  query?: string;
}
