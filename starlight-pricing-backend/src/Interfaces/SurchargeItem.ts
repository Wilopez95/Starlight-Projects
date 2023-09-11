import { CustomRatesGroupSurcharges } from '../database/entities/tenant/CustomRatesGroupSurcharges';
import { Context } from './Auth';
import { IBillableSurcharge } from './BillableSurcharge';
import { IGlobalRateLineItem } from './GlobalRateLineItem';
import { IGlobalRateService } from './GlobalRatesServices';
import { IGlobalRateSurcharge } from './GlobalRateSurcharge';
import { IOrderIncludedLineItem } from './LineItems';

export interface ISurchargeItemResolver {
  order_id: number;
  price_id: number;
  line_item_id: number;
  threshold_item_id: number;
}

export interface ICalculateSurcharges {
  globalRatesSurcharges?: IGlobalRateSurcharge[];
  customRatesSurcharges?: CustomRatesGroupSurcharges[];
  materialId?: number;
  billableServiceId?: number;
  billableServicePrice?: number;
  billableServiceApplySurcharges;
  lineItems?: IOrderIncludedLineItem[];
  surcharges?: IBillableSurcharge[];
  serviceQuantity?: number;
}

export interface ICalcRates {
  ctx: Context;
  businessUnitId: number;
  businessLineId: number;
  customRatesGroupId: number;
  type: string;
  billableServiceId: number | null;
  equipmentItemId: number | null;
  materialId: number | null;
  billableLineItems?: unknown[];
  recurringLineItemIds?: number[];
  billingCycle?: string | null;
  billableServiceIds?: number[];
  applySurcharges: boolean;
}
export interface ICalcRatesCustomRates {
  customRatesService?: CustomRatesGroupSurcharges[];
  customRatesLineItems?: CustomRatesGroupSurcharges[];
  customRatesServiceItems?: CustomRatesGroupSurcharges[];
  customRecurringLineItems?: CustomRatesGroupSurcharges[];
  customRatesSurcharges?: CustomRatesGroupSurcharges[];
}
export interface ICalcRatesGlobalRates {
  globalRatesService?: IGlobalRateService;
  globalRatesLineItems?: IGlobalRateLineItem[];
  globalRecurringLineItems?: IGlobalRateLineItem[];
  globalRatesServiceItems?: IGlobalRateService[];
  globalRatesSurcharges?: IGlobalRateSurcharge[];
}
export interface ICalcRatesResponse {
  customRates?: ICalcRatesCustomRates;
  globalRates?: ICalcRatesGlobalRates;
}
export interface ISurchargeItem {
  price?: number;
  amount?: number;
  billableServiceId: number;
  materialId: number;
  surchargeId: number;
  globalRatesSurchargesId: number;
  customRatesGroupSurchargesId: number;
}
