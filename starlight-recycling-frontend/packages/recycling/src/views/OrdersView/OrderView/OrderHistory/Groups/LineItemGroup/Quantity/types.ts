import { IBaseOrderHistoryChange } from '../../types';

export interface IOrderHistoryLineItemQuantityChanges
  extends IBaseOrderHistoryChange<number, number> {
  description: string;
  prefix?: string;
}
