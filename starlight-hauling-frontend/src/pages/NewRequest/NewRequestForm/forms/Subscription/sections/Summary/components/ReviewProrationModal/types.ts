import { IModal } from '@root/common/Modal/types';
import { ISubscriptionProration } from '@root/types';

export interface IReviewProrationModal extends IModal {
  proration: ISubscriptionProration;
  subscriptionId?: number;
}

export interface IProrationItem {
  id: number;
  nextBillingPeriodFrom: Date;
  nextBillingPeriodTo: Date;
  price: number | null;
  prorationEffectivePrice: number | null;
  prorationEffectiveDate: Date | null;
}

export interface IProrationLineItem extends IProrationItem {
  billableLineItemId: number;
}

export interface IProrationServiceItem extends IProrationItem {
  billableServiceId: number;
  lineItems: IProrationLineItem[];
  isProrated: boolean;
}

export interface IReviewProrationFormData {
  serviceItems: IProrationServiceItem[];
}
