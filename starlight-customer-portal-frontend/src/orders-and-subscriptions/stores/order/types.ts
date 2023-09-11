export type OrderStoreCount = Record<'total', number>;

export type OrderStoreCountResponse = {
  total: number;
  statuses: Record<any, number>;
};

export type GetCountOptions = {
  businessUnitId: string | number;
};
