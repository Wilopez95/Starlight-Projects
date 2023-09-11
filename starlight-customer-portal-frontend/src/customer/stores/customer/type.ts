import { AppliedFilterState } from '@root/core/common/TableTools/TableFilter';

export type CustomerRequestOptions = Record<string, unknown>;

export type CustomerStoreCount = {
  total: number;
  customerGroupIds: Record<string, number>;
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
  customerGroupId?: string;
  filterData?: AppliedFilterState;
}
