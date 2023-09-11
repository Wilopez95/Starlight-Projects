import { createElement } from 'react';
import { cssTransition, toast, ToastContent, ToastOptions } from 'react-toastify';
import { INotificationWithLink, NotificationWithLink } from '@starlightpro/shared-components';

import { formatString } from '../format/string';

import notifications from './notifications.json';
import { ActionCode, Notifications, UserAction } from './types';

import styles from './css/styles.scss';

const slide = cssTransition({
  enter: styles.slideIn,
  exit: styles.slideOut,
  duration: 750,
});

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class NotificationHelper {
  static notifications: Record<UserAction, Notifications> = notifications;

  static options: ToastOptions = {
    transition: slide,
    className: styles.toast,
  };

  private static getMessage(
    action: UserAction,
    code: ActionCode,
    ...rest: (string | number | Date)[]
  ) {
    return formatString(
      this.notifications[action][code] ?? this.notifications.default[code] ?? '',
      ...rest,
    );
  }

  static success(action: UserAction, ...rest: (string | number | Date)[]) {
    toast.success(this.getMessage(action, 'SUCCESS', ...rest), this.options);
  }

  static custom(type: 'warn' | 'success' | 'error' = 'warn', content: ToastContent) {
    toast[type](content, this.options);
  }

  static successWithLink(
    componentProps: Omit<INotificationWithLink, 'text'>,
    action: UserAction,
    ...rest: (string | number | Date)[]
  ) {
    toast.success(
      createElement(NotificationWithLink, {
        text: this.getMessage(action, 'SUCCESS', ...rest),
        ...componentProps,
      }),
      this.options,
    );
  }

  static error(
    action: UserAction,
    code: ActionCode = 'UNKNOWN',
    ...rest: (string | number | Date)[]
  ) {
    toast.error(this.getMessage(action, code, ...rest), this.options);
  }
}
