import { type AppliedFilterState } from '../../../../common/TableTools/TableFilter';

export type PayoutSortType =
  | 'DATE'
  | 'PAYOUT_ID'
  | 'CUSTOMER'
  | 'PAYMENT_FORM'
  | 'DEPOSIT'
  | 'AMOUNT';

export type RequestOptions = {
  filters?: AppliedFilterState;
  query?: string;
};
