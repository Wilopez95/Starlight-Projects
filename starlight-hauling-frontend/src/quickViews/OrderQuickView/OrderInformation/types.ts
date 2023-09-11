import { Order } from '@root/stores/entities';

export interface IOrderInformation {
  order: Order;
  onReschedule?(): void;
}
