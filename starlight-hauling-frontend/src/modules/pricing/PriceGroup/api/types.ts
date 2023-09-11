import { RequestQueryParams } from '@root/api/base';
import { BillingCycleEnum } from '@root/consts';
import {
  AllEntitiesType,
  BulkRatesAffectedEntity,
  BulkRatesCalculation,
  BulkRatesSource,
  BulkRatesTarget,
  NoneMaterialType,
} from '@root/modules/pricing/CustomRate/components/quickViews/CustomRateBulkEditQuickView/types';
import {
  IBusinessContextIds,
  ICustomer,
  ICustomerGroup,
  ICustomerJobSitePair,
  IEntity,
  IJobSite,
  IServiceArea,
  ThresholdSettingsType,
} from '@root/types';

import { PriceGroupsTab } from '../components/PriceGroupTable/types';

export interface IRequestSpecificOptions {
  businessUnitId: string;
  customerGroupId?: number;
  customerId?: number;
  customerJobSiteId?: number;
}

export interface IUpdateThresholdsRequest {
  overweightSetting?: ThresholdSettingsType;
  usageDaysSetting?: ThresholdSettingsType;
  demurrageSetting?: ThresholdSettingsType;
}

export interface IPricingPreviewResponse {
  previewPrices: IBillableItemPricingPreview[];
}

export interface IBulkRatesEditedPayload extends IBusinessContextIds {
  application: BulkRatesAffectedEntity;
  target: BulkRatesTarget;
  source: BulkRatesSource;
  calculation: BulkRatesCalculation;
  value: number;
  overridePrices: boolean;
  effectiveDate: Date;
  equipmentItems?: (number | AllEntitiesType)[];
  lineItems?: (number | AllEntitiesType)[];
  materials?: (number | AllEntitiesType | NoneMaterialType)[];
  services?: (number | AllEntitiesType)[];
  applyTo?: (number | AllEntitiesType)[];
}

export interface IGroupedPriceGroupsList {
  oneTimeLineItem?: IBillableItemPricingPreview[];
  oneTimeService?: IBillableItemPricingPreview[];
  recurringService?: IBillableItemPricingPreview[];
  recurringLineItem?: IBillableItemPricingPreview[];
  surcharge?: IBillableItemPricingPreview[];
}

export type billableItemTypes =
  | 'oneTimeLineItem'
  | 'oneTimeService'
  | 'recurringService'
  | 'recurringLineItem'
  | 'surcharge';

export interface IBillableItemPricingPreview extends IEntity {
  priceGroupDescription: string | null;
  hint: string | null;
  billableLineItemId: number | null;
  billableServiceId: number;
  billingCycle: BillingCycleEnum;
  frequencyId: number | null;
  entityType: string;
  equipmentItemId: number | null;
  surchargeId: number | null;
  thresholdId: number | null;
  materialId: number | null;
  priceGroupId: number;
  basePrice: string;
  price: string;
  user: string;
}

export interface IBulkRatesPreviewPayload extends IBusinessContextIds {
  application: BulkRatesAffectedEntity;
  target: BulkRatesTarget;
  source: BulkRatesSource;
  calculation: BulkRatesCalculation;
  value: number;
  effectiveDate: Date;
  equipmentItems?: (number | AllEntitiesType)[];
  lineItems?: (number | AllEntitiesType)[];
  materials?: (number | AllEntitiesType | NoneMaterialType)[];
  services?: (number | AllEntitiesType)[];
  applyTo?: (number | AllEntitiesType)[];
}

export type PriceGroupRequest = {
  type?: PriceGroupsTab;
  customerGroupId?: number;
  customerId?: number;
  customerJobSiteId?: number;
} & IBusinessContextIds &
  RequestQueryParams;

export interface ILinkedPriceGroupResponse extends IEntity {
  customers: ICustomer[];
  customerJobSites: (ICustomerJobSitePair & {
    customer: ICustomer;
    jobSite: IJobSite & { fullAddress: string };
  })[];
  customerGroups: ICustomerGroup[];
  serviceAreas: IServiceArea[];
}
