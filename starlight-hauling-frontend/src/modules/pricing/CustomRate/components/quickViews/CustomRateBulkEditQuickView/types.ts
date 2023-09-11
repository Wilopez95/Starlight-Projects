import { BillableItemActionEnum, BillingCycleEnum } from '@root/consts';
import { RatesEntityType } from '@root/modules/pricing/const';
import { IRecurringLineItemCustomRate } from '@root/modules/pricing/CustomRate/types';
import {
  IBusinessContextIds,
  ICustomer,
  ICustomerGroup,
  ICustomerJobSitePair,
  IEntity,
  IFrequency,
  IJobSite,
  ILineItemBillingCycleRate,
  IServiceArea,
} from '@root/types';

export type BulkEditPreviewTab =
  | RatesEntityType.oneTimeLineItem
  | RatesEntityType.oneTimeService
  | RatesEntityType.recurringService
  | RatesEntityType.recurringLineItem;

export enum BulkRatesAffectedEntity {
  customers = 'customers',
  customerJobSites = 'customerJobSites',
  customerGroups = 'customerGroups',
  serviceAreas = 'serviceAreas',
  specificPriceGroups = 'specificPriceGroups',
}

export const enum BulkRatesTargetType {
  all = 'all',
  services = 'services',
  lineItems = 'lineItems',
  recurringServices = 'recurringServices',
  recurringLineItems = 'recurringLineItems',
}

export type BulkRatesSource = 'global' | 'current';
export type BulkRatesCalculation = 'percentage' | 'flat';
export type BulkRatesDirection = 'increase' | 'decrease';
export type BulkRatesTarget =
  | BulkRatesTargetType.all
  | BulkRatesTargetType.services
  | BulkRatesTargetType.lineItems
  | BulkRatesTargetType.recurringServices
  | BulkRatesTargetType.recurringLineItems;

export enum BulkRatesEditType {
  allBillableItems = 'allBillableItems',
  allServices = 'allServices',
  specificServices = 'specificServices',
  allRecurringServices = 'allRecurringServices',
  specificRecurringServices = 'specificRecurringServices',
  allLineItems = 'allLineItems',
  specificLineItems = 'specificLineItems',
  allRecurringLineItems = 'allRecurringLineItems',
  specificRecurringLineItems = 'specificRecurringLineItems',
}

export type NoneMaterialType = 'INCLUDE_NONE_MATERIAL';
export type AllEntitiesType = 'INCLUDE_ALL';
export interface IBulkRatesEditFormData extends IBusinessContextIds {
  type: BulkRatesEditType;
  direction: BulkRatesDirection;
  application: BulkRatesAffectedEntity;
  value: number;
  source: BulkRatesSource;
  calculation: BulkRatesCalculation;
  effectiveDate: Date;
  applyTo?: (number | AllEntitiesType)[];
  services?: (number | AllEntitiesType)[];
  lineItems?: (number | AllEntitiesType)[];
  equipmentItems?: (number | AllEntitiesType)[];
  materials?: (number | AllEntitiesType | NoneMaterialType)[];
  overridePrices?: boolean;
  // for customer job site pair
  pairCustomerIds?: (number | AllEntitiesType)[];
}

export interface IBulkPreviewPriceGroupRateService {
  billableServiceId: number;
  equipmentItemId: number;
  materialId: number;
  price: string | number;
  finalPrice: string | number;
  value: string | number;
}
export interface IBulkPreviewPriceGroupRateRecurringService
  extends IBusinessContextIds,
    ILineItemBillingCycleRate,
    IEntity {
  action: BillableItemActionEnum;
  billableServiceId: number;
  billingCycle: BillingCycleEnum;
  equipmentItemId: number;
  globalRateId: number;
  materialId: number;
  frequencies?: IFrequency[];
}

export interface IBulkPreviewPriceGroupRateLineItem {
  lineItemId: number;
  value: number;
  price: string;
  finalPrice: string;
}

export interface IBulkRatesPreviewData {
  priceGroupId: number;
  oneTimeService: IBulkPreviewPriceGroupRateService[];
  oneTimeLineItem: IBulkPreviewPriceGroupRateLineItem[];
  recurringLineItem?: IRecurringLineItemCustomRate[];
  recurringService?: IBulkPreviewPriceGroupRateRecurringService[];
}
export interface IBulkRatesData {
  edit: IBulkRatesEditFormData;
  preview: IBulkRatesPreviewData;
}

export interface ILinkedPriceGroupsData {
  customers: ICustomer[];
  customerJobSites: (ICustomerJobSitePair & {
    customer: ICustomer;
    jobSite: IJobSite & { fullAddress: string };
  })[];
  customerGroups: ICustomerGroup[];
  serviceAreas: IServiceArea[];
}
