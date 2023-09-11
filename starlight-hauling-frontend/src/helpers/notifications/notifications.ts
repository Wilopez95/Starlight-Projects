import { createElement } from 'react';
import { cssTransition, toast, ToastContent, ToastOptions } from 'react-toastify';

import { NotificationWithLink } from '@root/common/NotificationWithLink/NotificationWithLink';
import { INotificationWithLink } from '@root/common/NotificationWithLink/types';

import { formatString } from '../format/string';

import notifications from './notifications.json';
import { ActionCode, Notifications, UserAction } from './types';

import styles from './css/styles.scss';

const slide = cssTransition({
  enter: styles.slideIn,
  exit: styles.slideOut,
  collapseDuration: 750,
});

export class NotificationHelper {
  static notifications: Record<UserAction, Notifications> = notifications;

  static options: ToastOptions = {
    transition: slide,
    icon: false,
    className: styles.toast,
  };

  private static getMessage(
    action: UserAction,
    code: ActionCode,
    ...rest: (string | number | Date)[]
  ) {
    return formatString(
      this.notifications[action][code] ??
        this.notifications.default[code] ??
        this.notifications.default.UNKNOWN!,
      ...rest,
    );
  }

  static success(action: UserAction, ...rest: (string | number | Date)[]) {
    toast.success(this.getMessage(action, ActionCode.SUCCESS, ...rest), this.options);
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
        text: this.getMessage(action, ActionCode.SUCCESS, ...rest),
        ...componentProps,
      }),
      this.options,
    );
  }

  static error(
    action: UserAction,
    code: ActionCode = ActionCode.UNKNOWN,
    ...rest: (string | number | Date)[]
  ) {
    const notificationCode = `${action}-${code}`;

    toast(this.getMessage(action, code, ...rest), {
      ...this.options,
      type: 'error',
      toastId: notificationCode,
    });
  }
}
