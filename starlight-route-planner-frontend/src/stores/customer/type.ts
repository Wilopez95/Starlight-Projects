export type CustomerRequestOptions = Record<string, unknown>;

export type CustomerStoreCount = {
  total: number;
  customerGroupIds: Record<string, number>;
};
