import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput, Layouts, ReminderIcon, TimePicker } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';

import { useIntl } from '@root/i18n/useIntl';
import { IWeightTicket } from '@root/types';

import { IWeightTicketSection } from '../../types';

import { TimePickerWrapper } from './styles';

const I18N_PATH = 'components.modals.WeightTicket.Text.';

export const TimeSection: React.FC<IWeightTicketSection> = ({ styleProps }) => {
  const { errors, values, setFieldValue } = useFormikContext<IWeightTicket>();
  const { t } = useTranslation();
  const { formatDateTime } = useIntl();

  useEffect(() => {
    if (values.arrivalTime && values.departureTime) {
      const distance = values.departureTime.getTime() - values.arrivalTime.getTime();

      setFieldValue('timeOnLandfill', new Date(distance));
    }
  }, [values.arrivalTime, values.departureTime, formatDateTime, setFieldValue]);

  const timeOnLandfillFormatted = useMemo(() => {
    return formatDateTime(values.timeOnLandfill ?? new Date(new Date().setUTCHours(0, 0, 0, 0)))
      .time24WithSeconds;
  }, [values.timeOnLandfill, formatDateTime]);

  return (
    <Layouts.Grid columns={styleProps.columnsTemplate} gap={styleProps.gap}>
      <TimePickerWrapper>
        <TimePicker
          label={t(`${I18N_PATH}ArrivalTime`)}
          name="arrivalTime"
          onChange={setFieldValue}
          value={values.arrivalTime}
          error={errors.arrivalTime}
        />
        <ReminderIcon />
      </TimePickerWrapper>

      <TimePickerWrapper>
        <TimePicker
          label={t(`${I18N_PATH}DepartureTime`)}
          name="departureTime"
          onChange={setFieldValue}
          value={values.departureTime}
          error={errors.departureTime}
        />
        <ReminderIcon />
      </TimePickerWrapper>
      <Layouts.Box />

      <TimePickerWrapper>
        <FormInput
          label={t(`${I18N_PATH}TimeOnLandfill`)}
          name="timeOnLandfill"
          value={timeOnLandfillFormatted}
          error={errors.timeOnLandfill}
          onChange={noop}
          disabled
          placeholder={'TimeOnLandfill'}
        />
        <ReminderIcon />
      </TimePickerWrapper>
    </Layouts.Grid>
  );
};
