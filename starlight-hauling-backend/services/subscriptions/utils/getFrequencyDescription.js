import { FREQUENCY_TYPE } from '../../../consts/frequencyTypes.js';

export const getFrequencyDescription = ({ type, times = 0 }) => {
  switch (type) {
    case FREQUENCY_TYPE.xPerWeek:
      return `${times}x per week`;
    case FREQUENCY_TYPE.everyXDays:
      return `Every ${times} days`;
    case FREQUENCY_TYPE.xPerMonth:
      return `Monthly`;
    case FREQUENCY_TYPE.onCall:
      return `On call`;
    default:
      return null;
  }
};
