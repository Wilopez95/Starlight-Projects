import {
  type RevertableStatus,
  type RevertToStatus,
  type ScheduledOrInProgress,
} from '@root/types';

import { type IForm } from '../types';

export interface IRevertOrderStatusForm<T> extends IForm<T> {
  status: RevertableStatus;
  toStatus?: ScheduledOrInProgress[];
}

export interface IRevertOrderStatusData {
  status?: RevertToStatus;
  comment?: string;
}

export interface IRevertStatusForm {
  status?: ScheduledOrInProgress;
  comment?: string;
}
