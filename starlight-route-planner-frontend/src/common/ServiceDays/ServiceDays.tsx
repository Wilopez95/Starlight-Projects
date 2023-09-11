import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts, Typography } from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';

import { DAYS_LIST } from '@root/consts';

import { IServiceDays } from './types';

const SERVICE_DAYS = 'serviceDaysOfWeek';
const I18N_PATH = 'quickViews.MasterRouteFiltersView.Text.';

export const ServiceDays: React.FC<IServiceDays> = ({
  title,
  error,
  disabled,
  name = SERVICE_DAYS,
}) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext();
  const serviceDays = useMemo(() => getIn(values, name) ?? [], [values, name]);
  const changeServiceDay = useCallback(
    (dayValue: number) => {
      setFieldValue(
        name,
        serviceDays.includes(dayValue)
          ? serviceDays.filter((d: number) => d !== dayValue)
          : [...serviceDays, dayValue],
      );
    },
    [setFieldValue, serviceDays, name],
  );

  return (
    <Layouts.Box>
      <Typography variant="bodyMedium" color="secondary" shade="light">
        {title ? title : t(`${I18N_PATH}ServiceDay`)}
      </Typography>
      <Layouts.Flex alignItems="flex-start" justifyContent="space-between">
        {DAYS_LIST.map((dayItem, i) => (
          <Layouts.Flex direction="column" key={i} justifyContent="flex-start" alignItems="center">
            <Layouts.Padding top="1" bottom="1">
              <Typography variant="headerFive" color="secondary">
                {dayItem.title}
              </Typography>
            </Layouts.Padding>
            <Checkbox
              name={name}
              onChange={() => changeServiceDay(dayItem.value)}
              value={serviceDays.includes(dayItem.value)}
              error={error}
              disabled={disabled}
            />
          </Layouts.Flex>
        ))}
      </Layouts.Flex>
    </Layouts.Box>
  );
};
