import { IFrequency } from '@root/core/types/entities/frequency';

export const fallback = '-';

export const formatFrequency = (frequency: IFrequency | undefined) => {
  if (!frequency || !frequency.type) {
    return fallback;
  }

  if (!frequency.times) {
    return frequency.type === 'onCall' ? 'By a call' : fallback;
  }

  switch (frequency.type) {
    case 'xPerWeek':
      return `${frequency.times} per week`;
    case 'xPerMonth':
      return `${frequency.times} per month`;
    case 'everyXDays':
      return frequency.times === 1 ? 'Every day' : `Every ${frequency.times} days`;
    default:
      return fallback;
  }
};
