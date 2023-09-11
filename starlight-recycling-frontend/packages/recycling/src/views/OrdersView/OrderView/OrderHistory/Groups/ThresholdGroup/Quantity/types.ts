import { IBaseOrderHistoryChange } from '../../types';

export interface IOrderHistoryThresholdItemQuantityChanges
  extends IBaseOrderHistoryChange<number, number> {
  description: string;
}
