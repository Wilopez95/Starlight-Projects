import { IBaseQuickView } from '@root/core/common/TableTools';

export type ISubscriptionQuickView = Omit<IBaseQuickView, 'newButtonRef'>;

export interface INewSubscriptionOrder {
  id: number;
  billableServiceId: number;
  quantity: number;
  globalRatesServicesId?: number;
  customRatesGroupServicesId?: number;
  price?: number;
  serviceDate?: Date;
  action?: string;
}
