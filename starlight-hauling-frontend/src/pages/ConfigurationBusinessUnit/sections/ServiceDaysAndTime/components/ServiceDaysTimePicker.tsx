import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, RadioButton, TimePicker } from '@starlightpro/shared-components';
import { format } from 'date-fns';

import { Typography } from '@root/common';

import styles from '../css/styles.scss';

const am = 'AM';
const pm = 'PM';

const I18N_PATH = 'common.DayTime.';

interface IServiceDaysTimePickerProps {
  fieldName: string;
  isError: boolean;
  disabled: boolean;
  errorText?: string;
  value?: Date;
  isStartTime?: boolean;
  isEndTime?: boolean;
  handleTimeChange(name: string, value: Date): void;
  handleTimeAmPmChange(amPm: string): void;
}

export const ServiceDaysTimePicker: React.FC<IServiceDaysTimePickerProps> = ({
  fieldName,
  isError,
  disabled,
  errorText,
  value,
  isStartTime,
  isEndTime,
  handleTimeChange,
  handleTimeAmPmChange,
}) => {
  const { t } = useTranslation();

  const handleAmChange = () => {
    handleTimeAmPmChange(am);
  };

  const handlePmChange = () => {
    handleTimeAmPmChange(pm);
  };

  return (
    <>
      <Layouts.Flex alignItems="center">
        <TimePicker
          onChange={handleTimeChange}
          borderError={isError}
          error={errorText}
          name={fieldName}
          value={value}
          disabled={disabled}
          wrapperClassName={styles.timePicker}
          noError
        />
        <RadioButton
          name={`${fieldName}.${am}`}
          disabled={disabled || !value}
          value={value ? format(value, 'aaa') === am : isStartTime}
          onChange={handleAmChange}
        >
          {t(`${I18N_PATH}AM`)}
        </RadioButton>
        <Layouts.Margin left="2">
          <RadioButton
            name={`${fieldName}.${pm}`}
            disabled={disabled || !value}
            value={value ? format(value, 'aaa') === pm : isEndTime}
            onChange={handlePmChange}
          >
            {t(`${I18N_PATH}PM`)}
          </RadioButton>
        </Layouts.Margin>
      </Layouts.Flex>
      {isError ? (
        <Layouts.Margin top="0.5">
          <Typography color="alert" variant="bodySmall">
            {errorText}
          </Typography>
        </Layouts.Margin>
      ) : null}
    </>
  );
};
