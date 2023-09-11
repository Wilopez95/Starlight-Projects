import { normalizeOptions } from '@root/helpers/normalizeOptions';
import { AprType, CustomerGroupType } from '@root/types';

import { BillingCycleEnum } from './billableItem';
import { isCore } from './env';

export const aprTypeOptions: AprType[] = ['standard', 'custom'];
export const billingCycleOptions: BillingCycleEnum[] = [
  BillingCycleEnum.daily,
  BillingCycleEnum.weekly,
  BillingCycleEnum.monthly,
];

export const paymentTermsOptions = normalizeOptions([
  { value: 'cod', label: 'COD' },
  'net15Days',
  'net30Days',
  'net60Days',
]);

export const invoiceConstructionOptions = normalizeOptions([
  { value: 'byOrder', label: isCore ? 'By Order' : 'By Order/Subscription' },
  'byAddress',
  'byCustomer',
]);

export const customerGroupOptions = normalizeOptions([
  CustomerGroupType.commercial,
  CustomerGroupType.nonCommercial,
]);

export enum CustomerStatus {
  active = 'active',
  onHold = 'onHold',
  inactive = 'inactive',
}
