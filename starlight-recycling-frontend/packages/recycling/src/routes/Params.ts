export const Params = {
  customerId: ':customerId',
  id: ':id',
  orderId: ':orderId',
  subPath: ':subPath',
  scaleId: ':scaleId',
};

export type ParamsKeys = Record<keyof typeof Params, string>;
