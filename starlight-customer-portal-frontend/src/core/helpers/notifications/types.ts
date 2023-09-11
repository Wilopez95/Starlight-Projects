import notifications from './notifications.json';

export type UserAction = keyof typeof notifications;

export type ActionCode =
  | 'SUCCESS'
  | 'CONFLICT'
  | 'UNKNOWN'
  | 'NOT_FOUND'
  | 'INVALID_MIME_TYPE'
  | 'INVALID_REQUEST'
  | 'PRECONDITION_FAILED'
  | 'FILE_TOO_LARGE';

export type Notifications = Partial<Record<ActionCode, string>>;
