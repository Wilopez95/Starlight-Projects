import { OrderStatusType, SubscriptionStatusEnum } from '..';

export interface IStoreCount {
  total: number;
  filteredTotal: number;
}

export type StoreCountResponse<T extends IStoreCount = IStoreCount> = Omit<T, keyof IStoreCount> & {
  total: number;
  filteredTotal?: number;
};

export type CustomerStoreCountResponse = IStoreCount & {
  customerGroupIds: Record<string, number>;
};

export type OrderStoreCountResponse = IStoreCount & {
  statuses: Record<OrderStatusType, number>;
};

export type SubscriptionStoreCountResponse = IStoreCount & {
  statuses: Record<SubscriptionStatusEnum, number>;
};

export interface INavigationCounts {
  customers: StoreCountResponse<CustomerStoreCountResponse>;
  jobSites: StoreCountResponse;
  landfillOperations: StoreCountResponse;
  orders: StoreCountResponse<OrderStoreCountResponse>;
  subscriptions: StoreCountResponse<SubscriptionStoreCountResponse>;
  subscriptionDrafts: StoreCountResponse;
  mineOrders: StoreCountResponse<OrderStoreCountResponse>;
  mineSubscriptions: StoreCountResponse<SubscriptionStoreCountResponse>;
  mineSubscriptionDrafts: StoreCountResponse;
  subscriptionOrders: StoreCountResponse;
  chats: StoreCountResponse;
}
