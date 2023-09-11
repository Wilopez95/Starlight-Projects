import { OrderStoreStatusType } from '@root/types';

export interface IOrderTable {
  mine?: boolean;
}

export interface IOrderTableParams {
  subPath: OrderStoreStatusType;
  orderId?: string;
}
