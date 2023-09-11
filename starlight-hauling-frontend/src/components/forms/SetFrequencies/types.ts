import { BillingCycleEnum } from '@root/consts';
import { FrequencyType, IFrequency } from '@root/types/entities/frequency';

import { type IForm } from '../types';

export interface ISetFrequenciesForm extends Omit<IForm<IFrequencyFormData>, 'onSubmit'> {
  billingCycles: BillingCycleEnum[];
  frequencies: IFrequency[];
  onSubmit(values: IFrequency[]): void;
}

export interface IFrequencyFormData {
  type: FrequencyType;
  frequencies: IFrequency[];
  xPerMonthTimes?: number;
  xPerWeekTimes?: number;
  everyXDaysTimes?: number;
  onCallTimes?: number;
}
