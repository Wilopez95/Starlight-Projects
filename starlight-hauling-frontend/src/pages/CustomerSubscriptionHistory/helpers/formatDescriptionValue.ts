import { TFunction } from 'i18next';
import { invert, isDate, isNil, pick } from 'lodash-es';

import { formatBestTimeToCome } from '@root/components/OrderTimePicker/helpers';
import { InformByEnum, SubscriptionHistoryAttributeEnum } from '@root/consts';
import {
  isAnnualEventReminderDescription,
  isBestTimeToComeDescription,
  isFrequencyDescription,
  isServiceDayDescription,
} from '@root/helpers';
import { IntlConfig } from '@root/i18n/types';
import { getFrequencyText } from '@root/pages/SystemConfiguration/components/Frequency/helpers';
import { SubscriptionHistoryDescriptionValue } from '@root/types';

const I18N_PATH = 'pages.CustomerSubscriptionHistory.Text.';
const fallback = '-';

export const formatDescriptionValue = (
  value: SubscriptionHistoryDescriptionValue | undefined,
  attribute: SubscriptionHistoryAttributeEnum | null,
  t: TFunction,
  { formatDateTime, weekDays }: IntlConfig,
) => {
  if (attribute === SubscriptionHistoryAttributeEnum.customRatesGroup && isNil(value)) {
    return t(`${I18N_PATH}GeneralPriceGroup`);
  }

  if (isNil(value)) {
    return fallback;
  }

  if (isDate(value)) {
    return formatDateTime(value).date;
  }

  if (typeof value === 'boolean') {
    return t(value ? `${I18N_PATH}Selected` : `${I18N_PATH}Deselected`);
  }

  if (isAnnualEventReminderDescription(value, attribute)) {
    if (!value.date) {
      return fallback;
    }

    return {
      date: formatDateTime(value.date).date,
      informBy: Object.entries(pick(value, Object.values(InformByEnum)))
        .filter(([, valueData]) => valueData)
        .map(([key]) => t(`consts.InformByEnum.${key}`))
        .join(', '),
    };
  }

  if (isBestTimeToComeDescription(value, attribute)) {
    const { bestTimeToCome, bestTimeToComeFrom, bestTimeToComeTo } = formatBestTimeToCome(
      value.bestTimeToComeFrom,
      value.bestTimeToComeTo,
    );

    if (bestTimeToCome === 'specific' && bestTimeToComeFrom && bestTimeToComeTo) {
      return `${bestTimeToComeFrom} - ${bestTimeToComeTo}`;
    }

    if (bestTimeToCome === 'am') {
      return t('components.OrderTimePicker.Text.AM');
    }

    if (bestTimeToCome === 'pm') {
      return t('components.OrderTimePicker.Text.PM');
    }

    if (bestTimeToCome === 'any') {
      return t('components.OrderTimePicker.Text.Anytime');
    }
  }

  if (isFrequencyDescription(value, attribute)) {
    return getFrequencyText(t, value.type, value.times);
  }

  if (isServiceDayDescription(value, attribute)) {
    return invert(weekDays)[value];
  }

  return value;
};
