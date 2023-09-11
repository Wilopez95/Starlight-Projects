/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import React from 'react';
import { Layouts, Tooltip } from '@starlightpro/shared-components';

import { DAYS_LIST } from '@root/consts';

import { formatAssignedServiceDaysList, formatServiceDaysOfWeek } from './helper';
import * as Styles from './styles';
import { IDaysStatusPreview, ParsedDay, ParsedDaysList, Status } from './types';

export const DaysStatusPreview: React.FC<IDaysStatusPreview> = ({
  assignedServiceDaysList,
  serviceDaysList,
  serviceDaysOfWeek,
  onClick,
  isLinked,
}) => {
  let data: ParsedDaysList = {};

  if (serviceDaysList && assignedServiceDaysList) {
    data = formatAssignedServiceDaysList(serviceDaysList, assignedServiceDaysList);
  }

  if (serviceDaysOfWeek) {
    data = formatServiceDaysOfWeek(serviceDaysOfWeek);
  }

  return (
    <Layouts.Flex>
      {DAYS_LIST.map(({ title, value }) => {
        const existingValue: ParsedDay | undefined = data[value];

        const status = existingValue ? Status[existingValue.type] : Status.disabled;

        // TODO: when proper mapping with hauling is implemented existingValue.route will be masterRouteId
        // meaning route prop should be remapped to route name before rendering
        return (
          <Tooltip key={value} position="top" text={existingValue?.route}>
            <Styles.DayLabel
              onClick={() => existingValue?.route && onClick?.(existingValue?.route)}
              status={status}
              isLinked={isLinked && existingValue?.isAssigned}
              requiredByCustomer={existingValue?.requiredByCustomer}
            >
              {title[0]}
            </Styles.DayLabel>
          </Tooltip>
        );
      })}
    </Layouts.Flex>
  );
};
