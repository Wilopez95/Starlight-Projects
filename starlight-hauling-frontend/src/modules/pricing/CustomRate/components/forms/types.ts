import {
  ILineItemCustomRate,
  IRecurringLineItemCustomRate,
  IRecurringServiceCustomRate,
  IServiceCustomRate,
  ISurchargeCustomRate,
  IThresholdCustomRate,
} from '@root/modules/pricing/CustomRate/types';

export type FormikPriceGroupRate<T> = T & {
  price: number | null;
  equipmentItemId: number;
  billableServiceId: number;
  thresholdId?: number | null;
  materialId: number | null;
  finalPrice: string | null;
  globalLimit?: number;
  operation?: boolean;
  value?: string;
  displayValue?: string;
};

export type PriceGroupRateType =
  | IServiceCustomRate
  | IRecurringServiceCustomRate
  | ILineItemCustomRate
  | IRecurringLineItemCustomRate
  | ISurchargeCustomRate
  | IThresholdCustomRate;
