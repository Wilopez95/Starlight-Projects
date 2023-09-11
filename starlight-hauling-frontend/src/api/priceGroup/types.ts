import {
  AllEntitiesType,
  BulkRatesAffectedEntity,
} from '@root/pages/SystemConfiguration/tables/PriceGroups/QuickView/BulkRatesEdit/types';
import { RatesEntityType } from '@root/types';
import { IBusinessContextIds } from '@root/types/base/businessContext';

export interface IPriceGroupServiceRequest extends IBusinessContextIds {
  priceGroupId: number;
  materialId?: number | null;
  equipmentItemId?: number;
  billableServiceId?: number;
}
export interface IPriceGroupServiceBatchRequest extends IBusinessContextIds {
  priceGroupIds: number[];
  materialIds: number[];
  equipmentItemIds: number[];
  billableServiceIds: number[];
}

export interface IPriceGroupLineItemRequest extends IBusinessContextIds {
  priceGroupId: number;
  lineItemId?: number;
  materialId?: number | null;
}

export interface IPriceGroupSurchargeRequest extends IBusinessContextIds {
  priceGroupId: number;
  surchargeId?: number;
  materialId?: number;
}

export interface IRatesHistoryRequest extends IBusinessContextIds {
  entityType: RatesEntityType;
  lineItemId?: number;
  billableServiceId?: number;
  materialId?: number | null;
  equipmentItemId?: number;
  thresholdId?: number;
  surchargeId?: number;
  customRatesGroupId?: number;
  billingCycle?: string;
  frequencyId?: number;
}

export interface IPriceGroupThresholdRequest extends IBusinessContextIds {
  thresholdId: number;
  materialId: number | undefined;
  equipmentItemId: number | undefined;
  priceGroupId: number;
}

export interface IBulkRatesEditTargetedPriceGroup extends IBusinessContextIds {
  application: BulkRatesAffectedEntity;
  applyTo: (number | AllEntitiesType)[];
}
