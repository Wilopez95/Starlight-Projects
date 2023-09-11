import { BillingCycleEnum } from '@root/consts/billableItem';
import { type FrequencyType } from '@root/types';

export const FrequencyTypes: FrequencyType[] = ['xPerWeek', 'xPerMonth', 'onCall', 'everyXDays'];
export const FrequencyTypesWithServiceDays: FrequencyType[] = ['xPerWeek', 'xPerMonth'];

export const frequencyConstraintsByCycles: Record<FrequencyType, BillingCycleEnum[]> = {
  everyXDays: [
    BillingCycleEnum.daily,
    BillingCycleEnum.weekly,
    BillingCycleEnum._28days,
    BillingCycleEnum.monthly,
    BillingCycleEnum.quarterly,
    BillingCycleEnum.yearly,
  ],
  onCall: [
    BillingCycleEnum.daily,
    BillingCycleEnum.weekly,
    BillingCycleEnum._28days,
    BillingCycleEnum.monthly,
    BillingCycleEnum.quarterly,
    BillingCycleEnum.yearly,
  ],
  xPerWeek: [
    BillingCycleEnum.weekly,
    BillingCycleEnum._28days,
    BillingCycleEnum.monthly,
    BillingCycleEnum.quarterly,
    BillingCycleEnum.yearly,
  ],
  xPerMonth: [BillingCycleEnum.monthly, BillingCycleEnum.quarterly, BillingCycleEnum.yearly],
};
