import { FrequencyType } from '@root/core/types';

export const getFrequencyText = (type: FrequencyType, times = 0): string => {
  switch (type) {
    case 'xPerWeek':
      return `${times}x per week`;
    case 'everyXDays':
      return `Every ${times} days`;
    case 'xPerMonth':
      return `Monthly`;
    case 'onCall':
      return `On call`;
  }
};
