import { ILineItem } from '@root/types';

import { IProrationItemComponent } from '../ProrationItem/types';

export interface ILineItemProration extends Omit<IProrationItemComponent, 'name'> {
  billableLineItems?: ILineItem;
}
