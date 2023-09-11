import { TFunction } from 'i18next';

import { type FrequencyType } from '@root/types/entities/frequency';

const I18N_PATH = 'pages.SystemConfiguration.components.Frequency.helpers.getFrequencyText.';

export const getFrequencyText = (t: TFunction, type: FrequencyType, times?: number): string => {
  return t(`${I18N_PATH}${type}`, { times });
};
