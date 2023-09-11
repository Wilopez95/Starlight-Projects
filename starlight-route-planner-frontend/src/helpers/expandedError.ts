/* eslint-disable default-param-last */
import * as Sentry from '@sentry/react';

import { NotificationHelper } from './notifications/notifications';
import { ActionCode, UserAction } from './notifications/types';

const NOT_SPECIFIED = 'not specified';

interface ISentryWithNotification {
  error: unknown;
  action: UserAction;
  code?: ActionCode;
}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class ExpandedError {
  static sentryWithNotification(
    params: ISentryWithNotification,
    rest: (string | number | Date)[] = [''],
  ) {
    const { error, action, code = 'UNKNOWN' } = params;

    Sentry.addBreadcrumb({
      category: action,
      message: `Error from ${action}:`,
      data: rest,
    });

    Sentry.captureException(error);

    NotificationHelper.error(action, code, ...rest);
  }

  static sentry(
    error: unknown,
    errorLocation = NOT_SPECIFIED,
    data?: {
      [key: string]: unknown;
    },
  ) {
    Sentry.addBreadcrumb({
      category: errorLocation,
      message: `Error from ${errorLocation}:`,
      data,
    });

    Sentry.captureException(error);
  }
}
