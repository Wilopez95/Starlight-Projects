import { AppliedFilterState } from '../../../../common/TableTools/TableFilter';

export type RequestOptions = {
  filters?: AppliedFilterState;
  query?: string;
};

export type PaymentSortType =
  | 'DATE'
  | 'PAYMENT_FORM'
  | 'PAYMENT_ID'
  | 'DEPOSIT'
  | 'STATUS'
  | 'UNAPPLIED'
  | 'AMOUNT'
  | 'CUSTOMER'
  | 'DEPOSIT_DATE';

export type DeferredPaymentSortType =
  | 'ID'
  | 'STATUS'
  | 'DATE'
  | 'AMOUNT'
  | 'CUSTOMER'
  | 'DEFERRED_UNTIL';
