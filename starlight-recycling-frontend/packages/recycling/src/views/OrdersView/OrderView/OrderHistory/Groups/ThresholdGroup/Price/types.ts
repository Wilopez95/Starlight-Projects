import { IBaseOrderHistoryChange } from '../../types';

export interface IOrderHistoryThresholdItemPriceChanges
  extends IBaseOrderHistoryChange<number, number> {
  description: string;
}
