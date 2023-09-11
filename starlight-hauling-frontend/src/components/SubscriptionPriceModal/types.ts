import { IModal } from '@root/common/Modal/types';
import { IBillableService, ILineItem, IServiceItemProration } from '@root/types';

export interface ISubscriptionPriceModal extends IModal {
  title: string;
  total: number;
  prorations: IServiceItemProration[][];
  billableServices: IBillableService[];
  billableLineItems: ILineItem[];
}
