import { init as initObserveCustomerTruck } from './observeCustomerTruck';
import { init as initObserveOrder } from './observeOrder';
import { init as initObserveOrderStatus } from './observeOrderStatus';

export const init = (): void => {
  initObserveOrder();
  initObserveOrderStatus();
  initObserveCustomerTruck();
};
