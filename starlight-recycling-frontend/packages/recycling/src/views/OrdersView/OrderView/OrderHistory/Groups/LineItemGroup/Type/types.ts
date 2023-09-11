import { IBaseOrderHistoryChange } from '../../types';

export interface IOrderHistoryLineItemTypeChanges
  extends IBaseOrderHistoryChange<number, number, any> {
  description: string;
}
