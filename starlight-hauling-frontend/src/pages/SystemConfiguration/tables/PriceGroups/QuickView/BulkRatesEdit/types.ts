import { BillableItemActionEnum, BillingCycleEnum } from '@root/consts';
import {
  IBusinessContextIds,
  ICustomer,
  ICustomerGroup,
  ICustomerJobSitePair,
  IEntity,
  IFrequency,
  IJobSite,
  ILineItemBillingCycleRate,
  IPriceGroupRateRecurringLineItem,
} from '@root/types';

export type BulkEditPreviewTab =
  | 'lineItems'
  | 'services'
  | 'recurringServices'
  | 'recurringLineItems';
export enum BulkRatesAffectedEntity {
  customers = 'customers',
  customerJobSites = 'customerJobSites',
  customerGroups = 'customerGroups',
  serviceAreas = 'serviceAreas',
  specificPriceGroups = 'specificPriceGroups',
}
export type BulkRatesSource = 'global' | 'current';
export type BulkRatesCalculation = 'percentage' | 'flat';
export type BulkRatesDirection = 'increase' | 'decrease';
export type BulkRatesTarget =
  | 'all'
  | 'services'
  | 'lineItems'
  | 'recurringServices'
  | 'recurringLineItems';
export enum BulkRatesEditType {
  allBillableItems = 'allBillableItems',
  allServices = 'allServices',
  specificServices = 'specificServices',
  allLineItems = 'allLineItems',
  specificLineItems = 'specificLineItems',
  allRecurringLineItems = 'allRecurringLineItems',
  specificRecurringLineItems = 'specificRecurringLineItems',
}

export type NoneMaterialType = 'INCLUDE_NONE_MATERIAL';
export type AllEntitiesType = 'INCLUDE_ALL';
export interface IBulkRatesEditData extends IBusinessContextIds {
  target: BulkRatesTarget;
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
  overrideUpdates?: boolean;
  checkPendingUpdates?: boolean;
  isPendingUpdates?: boolean;

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
  services: IBulkPreviewPriceGroupRateService[];
  lineItems: IBulkPreviewPriceGroupRateLineItem[];
  recurringLineItems?: IPriceGroupRateRecurringLineItem[];
  recurringServices?: IBulkPreviewPriceGroupRateRecurringService[];
}
export interface IBulkRatesData {
  edit: IBulkRatesEditData;
  preview: IBulkRatesPreviewData;
  financeChargeMethod?: string;
  financeChargeApr?: number;
  financeChargeMinBalance?: number;
  financeChargeMinValue?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IBulkRatesLinkedData extends IEntity {
  customers: ICustomer[];
  customerJobSites: (ICustomerJobSitePair & {
    customer: ICustomer;
    jobSite: IJobSite;
  })[];
  customerGroups: ICustomerGroup[];
}
