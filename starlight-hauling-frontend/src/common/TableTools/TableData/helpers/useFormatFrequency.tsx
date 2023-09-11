import { useTranslation } from 'react-i18next';
import { TFunction, TFunctionResult } from 'i18next';

import { IFrequency, ServiceFrequencyAggregated } from '@root/types/entities/frequency';

const I18N_PATH = 'common.TableTools.TableData.FormatService.Text.';

export const fallback = '-';

const translateFrequency = (frequency: IFrequency | undefined, t: TFunction) => {
  const times = frequency?.times;

  switch (frequency?.type) {
    case 'onCall':
      return t(`${I18N_PATH}OnCall`);
    case 'xPerMonth':
      return t(`${I18N_PATH}Monthly`);
    case 'xPerWeek':
      return times ? t(`${I18N_PATH}XPerWeek`, { times }) : fallback;
    case 'everyXDays':
      return times
        ? times === 1
          ? t(`${I18N_PATH}EveryDay`)
          : t(`${I18N_PATH}EveryXDays`, { times })
        : fallback;
    default:
      return fallback;
  }
};

export const useFormatFrequency = () => {
  const { t } = useTranslation();

  return (frequency: IFrequency | undefined): string => translateFrequency(frequency, t);
};

export const useAggregatedFormatFrequency = () => {
  const { t } = useTranslation();

  return (serviceFrequencyAggregated: ServiceFrequencyAggregated): TFunctionResult | string => {
    if (!serviceFrequencyAggregated) {
      return fallback;
    }

    if (serviceFrequencyAggregated === 'multiple') {
      return t(`${I18N_PATH}Multiple`);
    }

    return translateFrequency(serviceFrequencyAggregated, t);
  };
};
