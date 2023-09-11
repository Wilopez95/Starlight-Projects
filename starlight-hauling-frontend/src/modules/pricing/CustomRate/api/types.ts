import { IBusinessContextIds } from '@root/types/base/businessContext';
import { ConvertDateFields, DeepMap } from '../../../../types/helpers/JsonConversions';

import { RatesEntityType } from '../../const';
import {
  ILineItemCustomRate,
  IRecurringLineItemCustomRate,
  IRecurringServiceCustomRate,
  IServiceCustomRate,
  ISurchargeCustomRate,
  IThresholdCustomRate,
} from '../types';

export interface ICustomRatePayload {
  oneTimeService: IServiceCustomRate[] | null;
  recurringService: IRecurringServiceCustomRate[] | null;
  oneTimeLineItem: ILineItemCustomRate[] | null;
  recurringLineItem: DeepMap<ConvertDateFields<IRecurringLineItemCustomRate>>[] | null;
  surcharge: ISurchargeCustomRate[] | null;
  threshold: IThresholdCustomRate[] | null;
}
export interface ICustomRateRequestParams extends IBusinessContextIds {
  id: number;
  entityType?: RatesEntityType;
}

export interface IServiceCustomRateRequest extends IBusinessContextIds {
  materialId?: number | null;
  equipmentItemId?: number;
  billableServiceId?: number;
}

export interface IThresholdCustomRateRequest extends IBusinessContextIds {
  thresholdId: number;
  equipmentItemId?: number;
  materialId?: number;
}
