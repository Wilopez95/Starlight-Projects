import {
  IPriceGroupRateLineItem,
  IPriceGroupRateRecurringService,
  IPriceGroupRateService,
  IPriceGroupRateSurcharge,
  IPriceGroupRateThreshold,
} from '@root/types';
import { IRecurringServiceCustomRate } from '../../../../modules/pricing/CustomRate/types';

export type FormikPriceGroupRate<T> = Omit<T, 'id'> & {
  price?: number;
  globalLimit?: number;
  finalPrice?: string;
  operation?: boolean;
  value?: string;
  displayValue?: string;
  id?: number;
};

export type PriceGroupRateType =
  | FormikPriceGroupRate<IPriceGroupRateService>
  | FormikPriceGroupRate<IPriceGroupRateRecurringService>
  | FormikPriceGroupRate<IPriceGroupRateLineItem>
  | FormikPriceGroupRate<IPriceGroupRateSurcharge>
  | FormikPriceGroupRate<IPriceGroupRateThreshold>
  | FormikPriceGroupRate<IRecurringServiceCustomRate>;
