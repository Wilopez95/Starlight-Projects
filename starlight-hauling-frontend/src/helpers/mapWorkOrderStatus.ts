import * as Sentry from '@sentry/react';

import { WorkOrderStatus } from '@root/consts';

export const mapWorkOrderStatus = (status: WorkOrderStatus) => {
  switch (status) {
    case WorkOrderStatus.InProgress: {
      return 'In Progress';
    }
    case WorkOrderStatus.Completed: {
      return 'Completed';
    }
    case WorkOrderStatus.Assigned: {
      return 'Assigned';
    }
    case WorkOrderStatus.Canceled: {
      return 'Canceled';
    }
    case WorkOrderStatus.Unassigned: {
      return 'Unassigned';
    }
    case WorkOrderStatus.Scheduled: {
      return 'Scheduled';
    }
    case WorkOrderStatus.Blocked: {
      return 'Blocked';
    }
    default: {
      Sentry.captureMessage('Not valid status');

      return 'In Progress';
    }
  }
};
