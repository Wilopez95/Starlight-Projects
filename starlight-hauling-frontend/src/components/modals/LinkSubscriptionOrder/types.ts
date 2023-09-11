import { ILinkSubscriptionOrderData } from '@root/components/forms/LinkSubscriptionOrder/types';

import { IFormModal } from '../types';

export interface ILinkSubscriptionOrderModal extends IFormModal<ILinkSubscriptionOrderData> {
  title: string;
  businessLineId: string;
  // TODO: need BE to make this required
  customerId?: number;
  jobSiteId?: number;
  serviceAreaId?: number;
}
