import { ICustomQuickView } from '@root/common/QuickView';

import { IQuickView } from '../types';

export interface ICustomerSubscriptionOrderQuickView extends IQuickView {
  closeOnClick: boolean;
}

export interface IWorkOrderTable {
  subscriptionOrderId: number;
  oneTime: boolean;
  quickView: IQuickView;
}

export interface ISubscriptionOrderQuickView extends ICustomQuickView, IQuickView {}
