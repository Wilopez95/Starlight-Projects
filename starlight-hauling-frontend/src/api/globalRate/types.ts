import { IBusinessContextIds } from '@root/types/base/businessContext';

export interface IGlobalRatesServiceRequest extends IBusinessContextIds {
  materialId?: number | null;
  equipmentItemId?: number;
  billableServiceId?: number;
}

export interface IGlobalRatesThresholdRequest extends IBusinessContextIds {
  thresholdId: number;
  materialId: number | undefined;
  equipmentItemId: number | undefined;
}
