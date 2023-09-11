/* eslint-disable no-nested-ternary */
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useFormikContext } from 'formik';

import { useTimeZone } from '@root/hooks/useTimeZone';
import {
  INewRecurrentOrder,
  RecurrentFormCustomFrequencyType,
  RecurrentFormFrequencyType,
} from '@root/pages/NewRequest/NewRequestForm/forms/RecurrentOrder/types';
import { RecurrentOrder } from '@root/stores/entities';

import { useIntl } from '../i18n/useIntl';

const I18N_HOOK_PATH = 'hooks.useRecurrentTemplateFrequency.';
const I18N_DAYTIME_PATH = 'common.DayTime.';

export const useRecurrentTemplateFrequency = (isDetails?: boolean) => {
  const formikNewForm = useFormikContext<INewRecurrentOrder>();
  const formikDetails = useFormikContext<RecurrentOrder>();

  const values = isDetails ? formikDetails.values : formikNewForm.values.recurrentTemplateData;

  const { dateFormat } = useIntl();

  const { format: formatToTimeZone } = useTimeZone();
  const { t } = useTranslation();

  const getCustomType = useCallback(() => {
    const monthDay = values.frequencyDays?.[0]
      ? `${t(`${I18N_HOOK_PATH}OnDay`)} ${values.frequencyDays[0]}`
      : '';

    const week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekDays = values.frequencyDays
      ?.map(dayNumber => t(`${I18N_DAYTIME_PATH}${week[dayNumber]}`))
      .join(` ${t(`${I18N_HOOK_PATH}And`)} `);
    const weekDaysText = weekDays ? `${t(`${I18N_HOOK_PATH}On`)} ${weekDays}` : '';

    const frequencyType = {
      [RecurrentFormCustomFrequencyType.daily]: t(`${I18N_HOOK_PATH}Day`),
      [RecurrentFormCustomFrequencyType.weekly]: `${t(`${I18N_HOOK_PATH}Week`)} ${weekDaysText}`,
      [RecurrentFormCustomFrequencyType.monthly]: `${t(`${I18N_HOOK_PATH}Month`)} ${monthDay}`,
    };

    return values.customFrequencyType
      ? `${
          values.frequencyPeriod && Number(values.frequencyPeriod) !== 1
            ? values.frequencyPeriod
            : ''
        } ${frequencyType[values.customFrequencyType]}`
      : '';
  }, [t, values.customFrequencyType, values.frequencyDays, values.frequencyPeriod]);

  const getFrequency = useCallback(() => {
    const frequencyType = {
      [RecurrentFormFrequencyType.daily]: t(`${I18N_HOOK_PATH}Day`),
      [RecurrentFormFrequencyType.weekly]: t(`${I18N_HOOK_PATH}Week`),
      [RecurrentFormFrequencyType.monthly]: t(`${I18N_HOOK_PATH}Month`),
      [RecurrentFormFrequencyType.custom]: getCustomType(),
    };
    const frequenceText = values.frequencyType ? frequencyType[values.frequencyType] : '';

    return `${t(`${I18N_HOOK_PATH}Occurs`, {
      frequency: frequenceText,
      every: frequenceText ? t(`${I18N_HOOK_PATH}Every`) : '',
      date: values.startDate
        ? isDetails
          ? format(values.startDate, dateFormat.date)
          : formatToTimeZone(values.startDate, dateFormat.date)
        : null,
    })}`;
  }, [
    dateFormat.date,
    formatToTimeZone,
    getCustomType,
    isDetails,
    t,
    values.frequencyType,
    values.startDate,
  ]);

  return getFrequency();
};
