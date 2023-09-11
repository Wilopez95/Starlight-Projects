import { IBaseOrderHistoryChange } from '../../../types';

export interface IOrderHistoryBillableItemsQuantityChanges
  extends IBaseOrderHistoryChange<number, number> {}
