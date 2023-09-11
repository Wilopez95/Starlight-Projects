import React, { useMemo } from 'react';
import moment from 'moment';
import { useField } from 'react-final-form';
import { Trans, useTranslation } from '../../../i18n';
import TextField from '@starlightpro/common/components/TextField';
import { intervalToDuration } from 'date-fns';

export const NetTimeInput = () => {
  const {
    input: { value: arrivedAt },
  } = useField('arrivedAt', { subscription: { value: true } });
  const {
    input: { value: departureAt },
  } = useField('departureAt', { subscription: { value: true } });
  const [t] = useTranslation();

  const value = useMemo(() => {
    const end = moment(arrivedAt);
    const start = moment(departureAt);

    if (!start.isValid() || !end.isValid()) {
      return '';
    }

    const { years = 0, months = 0, days = 0, hours = 0, minutes = 0 } = intervalToDuration({
      start: start.toDate(),
      end: end.toDate(),
    });

    const timeStr = [
      years ? `${t(`YearWithCount`, { count: years })}, ` : '',
      months || years ? `${t(`MonthWithCount`, { count: months })}, ` : '',
      `${t('dayWithCount', { count: days })}, `,
      `${t('hourWithCount', { count: hours })}, `,
      `${t('minuteWithCount', { count: minutes })}`,
    ].join('');

    return timeStr;
  }, [arrivedAt, departureAt, t]);

  return (
    <TextField disabled required fullWidth label={<Trans>Time in yard</Trans>} value={value} />
  );
};
