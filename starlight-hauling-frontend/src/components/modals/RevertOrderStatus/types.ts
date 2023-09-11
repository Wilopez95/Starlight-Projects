import { type RevertableStatus, ScheduledOrInProgress } from '@root/types';

import { type IFormModal } from '../types';

export interface IRevertOrderStatusModal<T> extends IFormModal<T> {
  status: RevertableStatus;
  toStatus?: ScheduledOrInProgress[];
}
