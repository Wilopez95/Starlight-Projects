import { IBusinessContextIds } from '@root/types/base/businessContext';

import { RatesEntityType } from '../../const';
import {
  ILineItemGeneralRate,
  IRecurringLineItemGeneralRate,
  IRecurringServiceGeneralRate,
  IServiceGeneralRate,
  ISurchargeGeneralRate,
  IThresholdGeneralRate,
} from '../types';

export type GeneralRateRequestResponse = (
  | IServiceGeneralRate
  | IRecurringServiceGeneralRate
  | ILineItemGeneralRate
  | IRecurringLineItemGeneralRate
  | IRecurringLineItemGeneralRate
  | ISurchargeGeneralRate
  | IThresholdGeneralRate
)[];

export interface IGeneralRatePayload {
  oneTimeService: IServiceGeneralRate[] | null;
  recurringService: IRecurringServiceGeneralRate[] | null;
  oneTimeLineItem: ILineItemGeneralRate[] | null;
  recurringLineItem: IRecurringLineItemGeneralRate[] | null;
  surcharge: ISurchargeGeneralRate[] | null;
  threshold: IThresholdGeneralRate[] | null;
}
export interface IGeneralRateRequestParams extends IBusinessContextIds {
  entityType: RatesEntityType;
}

export interface IServiceGeneralRateRequest extends IBusinessContextIds {
  materialId?: number | null;
  equipmentItemId?: number;
  billableServiceId?: number;
}

export interface IThresholdGeneralRateRequest extends IBusinessContextIds {
  thresholdId: number;
  equipmentItemId?: number;
  materialId?: number;
}
