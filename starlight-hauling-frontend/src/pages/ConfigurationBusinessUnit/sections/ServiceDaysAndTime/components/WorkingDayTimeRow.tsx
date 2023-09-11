import React, { ChangeEvent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { format, parse } from 'date-fns';
import { useField, useFormikContext } from 'formik';

import { IBusinessUnit } from '@root/types';

import { ServiceDaysTimePicker } from './ServiceDaysTimePicker';

const I18N_PATH = 'common.DayTime.';
const startDay = '00:00:00';
const endDay = '12:00:00';

export interface IWorkingDayTimeRowProps {
  dayName: string;
  dayNumber: number;
}

export const WorkingDayTimeRow: React.FC<IWorkingDayTimeRowProps> = ({ dayName, dayNumber }) => {
  const { t } = useTranslation();
  const fieldName = `serviceDays[${dayNumber}]`;
  const { setFieldValue } = useFormikContext<IBusinessUnit>();
  const [{ value: enableValue }] = useField<boolean>(`${fieldName}.active`);
  const [{ value: startValue }, { error: startTimeError }, { setError: setStartTimeError }] =
    useField<string>(`${fieldName}.startTime`);
  const [{ value: endValue }, { error: endTimeError }, { setError: setEndTimeError }] =
    useField<string>(`${fieldName}.endTime`);

  const parsedStartTime = startValue ? parse(startValue, 'HH:mm:ss', new Date()) : undefined;
  const parsedEndTime = endValue ? parse(endValue, 'HH:mm:ss', new Date()) : undefined;

  const formatTimeValue = useCallback(
    (fieldNameInfo: string, amPm: string, parsedValue?: Date) => {
      if (!parsedValue) {
        return;
      }

      const formattedTime = format(parsedValue, 'hh:mm');
      const parsedNewTime = parse(`${formattedTime} ${amPm}`, 'hh:mm aaa', new Date());

      setFieldValue(fieldNameInfo, format(parsedNewTime, 'HH:mm:ss'));
    },
    [setFieldValue],
  );

  const handleTimeChange = (name: string, value: Date) => {
    const formattedTime = format(value, 'HH:mm:ss');

    setFieldValue(name, formattedTime);
  };

  const handleDayCheckbox = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setFieldValue(e.target.name, !enableValue);
      setFieldValue(`${fieldName}.startTime`, enableValue ? null : startDay);
      setFieldValue(`${fieldName}.endTime`, enableValue ? null : endDay);

      if (enableValue) {
        setStartTimeError('');
        setEndTimeError('');
      }
    },
    [fieldName, enableValue, setFieldValue, setStartTimeError, setEndTimeError],
  );

  const handleStartTimeAmPm = useCallback(
    (amPm: string) => formatTimeValue(`${fieldName}.startTime`, amPm, parsedStartTime),
    [parsedStartTime, fieldName, formatTimeValue],
  );

  const handleEndTimeAmPm = useCallback(
    (amPm: string) => formatTimeValue(`${fieldName}.endTime`, amPm, parsedEndTime),
    [parsedEndTime, fieldName, formatTimeValue],
  );

  return (
    <Layouts.Margin top="2" bottom="2">
      <Layouts.Flex alignItems="flex-start">
        <Layouts.Box as={Layouts.Margin} top="1" width="20rem">
          <Checkbox name={`${fieldName}.active`} value={enableValue} onChange={handleDayCheckbox}>
            {t(`${I18N_PATH}${dayName}`)}
          </Checkbox>
        </Layouts.Box>
        <Layouts.Box as={Layouts.Margin} right="5" width="27rem">
          <ServiceDaysTimePicker
            handleTimeChange={handleTimeChange}
            handleTimeAmPmChange={handleStartTimeAmPm}
            fieldName={`${fieldName}.startTime`}
            isError={!!startTimeError}
            errorText={startTimeError}
            value={parsedStartTime}
            disabled={!enableValue}
            isStartTime
          />
        </Layouts.Box>
        <Layouts.Box width="27rem">
          <ServiceDaysTimePicker
            handleTimeChange={handleTimeChange}
            handleTimeAmPmChange={handleEndTimeAmPm}
            fieldName={`${fieldName}.endTime`}
            isError={!!endTimeError}
            errorText={endTimeError}
            value={parsedEndTime}
            disabled={!enableValue}
            isEndTime
          />
        </Layouts.Box>
      </Layouts.Flex>
    </Layouts.Margin>
  );
};
