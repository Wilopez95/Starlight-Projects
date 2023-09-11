import {
  ILineItemGeneralRate,
  IRecurringLineItemGeneralRate,
  IRecurringServiceGeneralRate,
  IServiceGeneralRate,
  ISurchargeGeneralRate,
  IThresholdGeneralRate,
} from '@root/modules/pricing/GeneralRate/types';

export type GeneralRateType =
  | IServiceGeneralRate
  | IRecurringServiceGeneralRate
  | ILineItemGeneralRate
  | IRecurringLineItemGeneralRate
  | ISurchargeGeneralRate
  | IThresholdGeneralRate;
