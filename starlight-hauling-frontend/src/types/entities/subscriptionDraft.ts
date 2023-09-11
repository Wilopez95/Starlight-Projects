import { BillingCycleEnum, BillingTypeEnum } from '@root/consts';
import {
  ISubscriptionLineItemChangeEvent,
  ISubscriptionOrderChangeEvent,
  ISubscriptionServiceChangeEvent,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { IAddress, IPurchaseOrder } from '@root/types';

import { IEntity } from './entity';
import { EquipmentItemType } from './equipmentItem';
import { ISubscription, SubscriptionStatusEnum } from './subscription';
import { IThirdPartyHauler } from './thirdPartyHauler';

type RequiredSubscriptionProps =
  | 'createdAt'
  | 'updatedAt'
  | 'businessUnit'
  | 'businessLine'
  | 'customer'
  | 'endDate'
  | 'grandTotal'
  | 'jobSite'
  | 'jobSiteContact'
  | 'jobSiteContactTextOnly'
  | 'serviceFrequencyAggregated'
  | 'serviceName'
  | 'startDate'
  | 'serviceItems'
  | 'serviceArea'
  | 'customRatesGroup'
  | 'creditCard'
  | 'promo'
  | 'lineItems'
  | 'driverInstructions'
  | 'highPriority'
  | 'permit'
  | 'purchaseOrder'
  | 'bestTimeToComeFrom'
  | 'bestTimeToComeTo'
  | 'thirdPartyHauler'
  | 'billingType'
  | 'billingCycle'
  | 'anniversaryBilling'
  | 'nextBillingPeriodTo'
  | 'minBillingPeriods'
  | 'nextBillingPeriodFrom'
  | 'proration';

type PartialSubscriptionProps = 'subscriptionContact' | 'csr' | 'someoneOnSite';

export interface ISubscriptionDraft
  extends IEntity,
    Pick<ISubscription, RequiredSubscriptionProps>,
    Partial<Pick<ISubscription, PartialSubscriptionProps>> {
  permitRequired: boolean;
  poRequired: boolean;
  signatureRequired: boolean;
  alleyPlacement: boolean;
  competitor: IThirdPartyHauler | null;
  competitorExpirationDate: Date | null;
  unlockOverrides: boolean;
  csrEmail: string;
  csrComment?: string;
}

export interface IConfigurableSubscriptionDraft extends IEntity {
  jobSiteContactId: number;
  jobSiteContactTextOnly: boolean;
  driverInstructions: string | null;
  purchaseOrder: IPurchaseOrder | null;
  permitId: number | null;
  bestTimeToComeFrom: string | Date | null;
  bestTimeToComeTo: string | Date | null;
  highPriority: boolean;
  thirdPartyHaulerId: number | null;
  subscriptionContactId: number;
  startDate: Date | null;
  endDate: Date | null;
  minBillingPeriods: number | null;
  unlockOverrides: boolean;
  promoId: number | null;
  serviceAreaId: number | null;
  jobSiteNote: string | null;
  poRequired: boolean;
  alleyPlacement: boolean;
  permitRequired: boolean;
  anniversaryBilling: boolean;
  signatureRequired: boolean;
  someoneOnSite: boolean;
  grandTotal: number | null;
  customRatesGroupId: number | null;
  equipmentType: EquipmentItemType | null;
  competitorId: number | null;
  competitorExpirationDate: Date | null;
  serviceItems?: ISubscriptionServiceChangeEvent[];
  lineItems?: ISubscriptionLineItemChangeEvent[];
  subscriptionOrders?: ISubscriptionOrderChangeEvent[];
  billingCycle?: BillingCycleEnum;
  billingType?: BillingTypeEnum;
}

export interface IInvoicingSubscriptions {
  id: number;
  anniversaryBilling: boolean;
  businessLineId: number;
  businessUnitId: number;
  billingCycle: BillingCycleEnum;
  billingType: BillingTypeEnum;
  nextBillingPeriodFrom: number | Date;
  nextBillingPeriodTo: number | Date;
  startDate: Date | null;
  endDate: Date | null;
  summaryPerServiceItem: {
    price: number;
    serviceItemId: string;
    serviceName: string;
    serviceItemsApplicable: IServiceItemApplicable[];
    lineItemsProrationInfo: ILineItemsProrationInfo[];
  }[];
  serviceItems: {
    price: number;
    quantity: number;
    serviceItemId: string;
    serviceName: string;
    serviceItemsApplicable: IServiceItemApplicable[];
    lineItemsProrationInfo: ILineItemsProrationInfo[];
    billableService: { description: string };
    lineItems: { price: number; quantity: number }[];
    subscriptionOrders: { sequenceId: string }[];
  }[];
  jobSiteAddress: IAddress;
  totalPriceForSubscription: number;
  status: SubscriptionStatusEnum;
}

export interface ILineItemsProrationInfo {
  totalPrice: number;
  totalDay: number;
  usageDay: number;
  price: number;
  quantity: number;
  proratedTotal: number;
  nextBillingPeriodTo: string;
  nextBillingPeriodFrom: string;
  description: string;
  effectiveDate: string | null;
  from: string | null;
  id: number;
  lineItemId: number;
  prorationEffectiveDate: string | null;
  prorationEffectivePrice: string | null;
  serviceDaysOfWeek: unknown;
  since: string;
  subscriptionServiceItemId: number;
}

export interface IServiceItemApplicable {
  description: string;
  effectiveDate: string | null;
  from: string;
  isApplicable: boolean;
  nextBillingPeriodFrom: string;
  nextBillingPeriodTo: string;
  price: number;
  proratedTotal: number;
  prorationEffectiveDate: null;
  prorationEffectivePrice: null;
  quantity: number;
  since: string;
  subscriptionOrdersSort: ISubscriptionOrders[];
  subscriptionOrdersTotal: number;
  totalDay: number;
  totalPrice: number;
  usageDay: number;
}

export interface ISubscriptionOrders {
  subscriptionOrderId: number;
  price: number;
  status: string;
  quantity: number;
  grandTotal: number;
  jobSiteId: number;
  serviceDate: string;
  serviceName: string;
  id: number;
}
