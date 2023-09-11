import { IBaseQuickView } from '@root/common/TableTools';

export interface ICustomerSubscriptionOrderEditQuickView
  extends Omit<IBaseQuickView, 'newButtonRef'> {
  closeOnSubmit?: boolean;
}
