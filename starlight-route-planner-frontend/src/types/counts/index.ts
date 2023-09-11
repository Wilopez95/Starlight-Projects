export interface IStoreCount {
  total: number;
  filteredTotal?: number;
}

export type StoreCountResponse<T extends IStoreCount = IStoreCount> = Omit<T, keyof IStoreCount> & {
  total: number;
  filteredTotal?: number;
};

export type CustomerStoreCountResponse = IStoreCount & {
  customerGroupIds: Record<string, number>;
};

export interface INavigationCounts {
  customers: StoreCountResponse<CustomerStoreCountResponse>;
  orders: StoreCountResponse;
  subscriptions: StoreCountResponse;
  jobSites: StoreCountResponse;
  landfillOperations: StoreCountResponse;
  subscriptionDrafts: StoreCountResponse;
  mineOrders: StoreCountResponse;
  mineSubscriptions: StoreCountResponse;
  mineSubscriptionDrafts: StoreCountResponse;
  subscriptionOrders: StoreCountResponse;
}
