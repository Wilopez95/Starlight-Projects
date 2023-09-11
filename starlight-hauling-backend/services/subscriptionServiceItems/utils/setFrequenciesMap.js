import { getFrequencyAndServiceDaysForServiceItem } from '../getFrequencyAndServiceDays.js';
import { validateCorrectServiceDaysRegardingFrequency } from './validateCorrectServiceDaysRegardingFrequency.js';

export const setFrequenciesMap = async (
  ctxState,
  { serviceItem, serviceItemsFrequenciesMap },
  trx,
) => {
  const { frequency, serviceDaysOfWeek } = await getFrequencyAndServiceDaysForServiceItem(
    ctxState,
    serviceItem,
    trx,
  );

  validateCorrectServiceDaysRegardingFrequency(serviceDaysOfWeek, frequency);

  if (frequency) {
    serviceItemsFrequenciesMap[frequency.id] = frequency;
  }
};
