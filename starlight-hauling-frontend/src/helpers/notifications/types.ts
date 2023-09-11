import i18next from 'i18next';

import notifications from './notifications.json';

export type UserAction = keyof typeof notifications;

export enum ActionCode {
  SUCCESS = 'SUCCESS',
  CONFLICT = 'CONFLICT',
  UNKNOWN = 'UNKNOWN',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_MIME_TYPE = 'INVALID_MIME_TYPE',
  INVALID_REQUEST = 'INVALID_REQUEST',
  PRECONDITION_FAILED = 'PRECONDITION_FAILED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  ACCESS_DENIED = 'ACCESS_DENIED',
  BAD_REQUEST = 'BAD_REQUEST',
  NO_INTERNET = 'NO_INTERNET',
  EXPIRED_END_DATE = 'EXPIRED_END_DATE',
}

export const ActionDefaultMessages = {
  CONNECTION_IS_LOST: i18next.t('GeneralErrors.ConnectionIsLost'),
};

export type Notifications = Partial<Record<ActionCode, string>>;
