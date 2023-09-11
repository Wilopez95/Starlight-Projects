import { ILineItemProrationInfo } from '@root/types';

import { IProrationItemComponent } from '../ProrationItem/types';

export type LineItemProrationComponent = Omit<IProrationItemComponent, 'label'> &
  Pick<ILineItemProrationInfo, 'billableLineItemId'>;
