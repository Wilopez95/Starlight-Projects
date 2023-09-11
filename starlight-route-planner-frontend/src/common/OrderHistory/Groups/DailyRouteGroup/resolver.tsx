import React from 'react';

import { AvailableDailyRouteHistoryAttributes } from '@root/types';

import { HistoryChanges, HistoryEventType } from '../../components/HistoryGroup/types';

import { DateRow } from './DateRow/DateRow';
import { NameRow } from './NameRow/NameRow';
import { OdometerRow } from './OdometerRow/OdometerRow';
import { StatusRow } from './StatusRow/StatusRow';
import { TimeRow } from './TimeRow/TimeRow';
import { WeightTicketsRow } from './WeightTicketsRow/WeightTicketsRow';
import { WorkOrdersRow } from './WorkOrdersRow/WorkOrdersRow';

export const resolveEditedChanges = <T extends keyof typeof AvailableDailyRouteHistoryAttributes>(
  change: HistoryChanges<T>,
  eventType: HistoryEventType,
): React.ReactNode => {
  const props = {
    attribute: change.attribute,
    actualChanges: change.actualChanges,
  };

  switch (change.attribute) {
    case AvailableDailyRouteHistoryAttributes.name:
    case AvailableDailyRouteHistoryAttributes.driverName:
    case AvailableDailyRouteHistoryAttributes.truckName:
      return <NameRow {...props} />;
    case AvailableDailyRouteHistoryAttributes.odometerStart:
    case AvailableDailyRouteHistoryAttributes.odometerEnd:
      return <OdometerRow {...props} />;
    case AvailableDailyRouteHistoryAttributes.status:
      return <StatusRow {...props} />;
    case AvailableDailyRouteHistoryAttributes.serviceDate:
    case AvailableDailyRouteHistoryAttributes.completedAt:
      return <DateRow {...props} />;
    case AvailableDailyRouteHistoryAttributes.clockIn:
    case AvailableDailyRouteHistoryAttributes.clockOut:
      return <TimeRow {...props} />;
    case AvailableDailyRouteHistoryAttributes.workOrderIds:
      return <WorkOrdersRow {...props} />;
    case AvailableDailyRouteHistoryAttributes.ticketNumber:
      return <WeightTicketsRow changes={props} eventType={eventType} />;
    default:
      return null;
  }
};
