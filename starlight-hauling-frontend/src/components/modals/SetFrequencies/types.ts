import { BillingCycleEnum } from '@root/consts';

import { type IFormModal } from '../types';

export interface ISetFrequencyModal<T> extends IFormModal<T> {
  frequencies: T;
  billingCycles: BillingCycleEnum[];
}
