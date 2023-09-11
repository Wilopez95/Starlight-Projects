import { type AppliedFilterState } from '@root/common/TableTools/TableFilter';

export interface IPaymentSubPage {
  filters?: AppliedFilterState;
  query?: string;
}

export type NavigationKeys = 'payments' | 'payouts';

export type PaymentParams = {
  id: string;
};

export type PaymentAndPayoutsParams = {
  subPath: string;
};
