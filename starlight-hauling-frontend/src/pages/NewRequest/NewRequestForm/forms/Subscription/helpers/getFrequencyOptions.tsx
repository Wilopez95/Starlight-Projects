import { ISelectOption } from '@starlightpro/shared-components';

import { getPreSelectedHistoricalOption } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/helpers/getPreSelectedFieldData';
import { getFrequencyText } from '@root/pages/SystemConfiguration/components/Frequency/helpers';

import { IGetFrequencyOptions } from './types';

export const getFrequencyOption = ({
  t,
  serviceItem,
  frequencies,
}: IGetFrequencyOptions): ISelectOption[] => {
  const historicalFrequency = {
    value: serviceItem.serviceFrequency?.[0]?.id ?? '',
    label:
      (serviceItem.serviceFrequency?.[0]?.type &&
        getFrequencyText(
          t,
          serviceItem.serviceFrequency?.[0]?.type,
          serviceItem.serviceFrequency?.[0]?.times,
        )) ??
      '',
  };

  const frequencyOptions = frequencies.map(frequency => ({
    value: frequency.id,
    label: getFrequencyText(t, frequency.type, frequency.times),
  }));

  const preSelectedHistoricalFrequency = getPreSelectedHistoricalOption(
    frequencyOptions,
    historicalFrequency,
  );

  return preSelectedHistoricalFrequency
    ? [preSelectedHistoricalFrequency, ...frequencyOptions]
    : frequencyOptions;
};
