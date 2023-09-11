import { ILineItem } from '@root/types';

import { IBaseOrderHistoryChange } from '../../types';

export interface IOrderHistoryLineItemTypeChanges
  extends IBaseOrderHistoryChange<number, number, ILineItem | null | number | undefined> {
  description: string;
}
