import { IBaseOrderHistoryChange } from '../../../types';

export interface IOrderHistoryLineItemPriceChanges
  extends IBaseOrderHistoryChange<number, number> {}
