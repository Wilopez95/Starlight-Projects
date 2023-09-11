export type OrderStoreCount = Record<'total', number>;

export type OrderStoreCountResponse = {
  total: number;
};

export type GetCountOptions = {
  businessUnitId: number;
};
