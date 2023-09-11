import React, { useMemo } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { convertToMondayZeroBase } from '@root/i18n/helpers';
import { useIntl } from '@root/i18n/useIntl';

import { IWeekDays } from './types';

const WeekDays: React.FC<IWeekDays> = ({ serviceDays }) => {
  const intlConfig = useIntl();
  const convertedDays = convertToMondayZeroBase(intlConfig.weekDays);
  const days = useMemo(
    () =>
      serviceDays.map(item => {
        const day = Object.keys(convertedDays).find(key => convertedDays[key] === item);

        return day ? intlConfig.weekDays[day] : [];
      }),
    [serviceDays, convertedDays, intlConfig.weekDays],
  );

  return (
    <Layouts.Flex>
      {Object.entries(intlConfig.weekDays).map(([day, value]) => (
        <Layouts.Padding key={value} right="0.5">
          <Typography
            variant="bodyMedium"
            {...(days.includes(value)
              ? { color: 'secondary', shade: 'light' }
              : {
                  color: 'grey',
                  shade: 'standard',
                })}
          >
            {day.charAt(0)}
          </Typography>
        </Layouts.Padding>
      ))}
    </Layouts.Flex>
  );
};

export default observer(WeekDays);
