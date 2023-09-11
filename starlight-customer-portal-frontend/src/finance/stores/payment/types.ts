import { AppliedFilterState } from '@root/core/common/TableTools/TableFilter';

export type RequestOptions = {
  filters?: AppliedFilterState;
  query?: string;
};

export type PaymentSortType = 'DEFERRED_UNTIL' | 'CUSTOMER_NAME' | 'DATE';
