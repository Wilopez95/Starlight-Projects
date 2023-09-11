import { Colors } from '@starlightpro/shared-components';

import { SubscriptionHistoryActionEnum, SubscriptionHistoryAttributeEnum } from '@root/consts';
import {
  FrequencyDescriptionValue,
  IBestTimeToComeDescriptionValue,
  IReminderDescriptionValue,
  JsonConversions,
  SubscriptionHistoryDescriptionValue,
} from '@root/types';

const colorByAction: Record<SubscriptionHistoryActionEnum, Colors> = {
  [SubscriptionHistoryActionEnum.added]: 'success',
  [SubscriptionHistoryActionEnum.changed]: 'information',
  [SubscriptionHistoryActionEnum.removed]: 'alert',
  [SubscriptionHistoryActionEnum.other]: 'grey',
};

export const getColorBySubscriptionHistoryAction = (status: SubscriptionHistoryActionEnum) => {
  return colorByAction[status];
};

export const isDateSubscriptionHistoryAttribute = (
  attribute: SubscriptionHistoryAttributeEnum | null,
) => {
  return (
    attribute &&
    [
      SubscriptionHistoryAttributeEnum.endDate,
      SubscriptionHistoryAttributeEnum.startDate,
      SubscriptionHistoryAttributeEnum.serviceDate,
    ].includes(attribute)
  );
};

export const isAnnualEventReminderDescription = (
  value: SubscriptionHistoryDescriptionValue | JsonConversions<SubscriptionHistoryDescriptionValue>,
  attribute: SubscriptionHistoryAttributeEnum | null,
): value is IReminderDescriptionValue | JsonConversions<IReminderDescriptionValue> => {
  return attribute === SubscriptionHistoryAttributeEnum.annualReminder;
};

export const isFrequencyDescription = (
  value: SubscriptionHistoryDescriptionValue | JsonConversions<SubscriptionHistoryDescriptionValue>,
  attribute: SubscriptionHistoryAttributeEnum | null,
): value is FrequencyDescriptionValue => {
  return attribute === SubscriptionHistoryAttributeEnum.serviceFrequency;
};

export const isBestTimeToComeDescription = (
  value: SubscriptionHistoryDescriptionValue,
  attribute: SubscriptionHistoryAttributeEnum | null,
): value is IBestTimeToComeDescriptionValue => {
  return attribute === SubscriptionHistoryAttributeEnum.bestTimeToCome;
};

export const isServiceDayDescription = (
  value: SubscriptionHistoryDescriptionValue,
  attribute: SubscriptionHistoryAttributeEnum | null,
): value is number => {
  return attribute === SubscriptionHistoryAttributeEnum.serviceDay;
};
