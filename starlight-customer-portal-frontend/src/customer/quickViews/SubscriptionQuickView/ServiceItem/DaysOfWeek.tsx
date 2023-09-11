import React, { useMemo } from 'react';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useRegionConfig } from '@root/core/hooks';
import { IServiceDaysOfWeek } from '@root/core/types';

const ServiceDaysList: React.FC<{ serviceDaysOfWeek?: IServiceDaysOfWeek }> = ({
  serviceDaysOfWeek,
}) => {
  const regionConfig = useRegionConfig();
  const dayOfWeek = useMemo(() => Object.keys(regionConfig.weekDays).map((day) => day.charAt(0)), [
    regionConfig.weekDays,
  ]);

  return (
    <Layouts.Flex>
      {dayOfWeek.map((day, idx) => {
        const hasServiceAt = serviceDaysOfWeek
          ? Object.prototype.hasOwnProperty.call(serviceDaysOfWeek, idx)
          : false;

        return (
          <Layouts.Padding key={`${day} ${idx}`} right='0.5'>
            {hasServiceAt ? (
              <Typography as='span' color='primary' shade='standard' variant='bodyMedium'>
                {day}
              </Typography>
            ) : (
              <Typography as='span' color='secondary' shade='desaturated' variant='bodyMedium'>
                {day}
              </Typography>
            )}
          </Layouts.Padding>
        );
      })}
    </Layouts.Flex>
  );
};

export default observer(ServiceDaysList);
