import { BillingCycleEnum, BillingTypeEnum } from '@root/consts';
import { ICreditCard } from '@root/modules/billing/types';
import {
  ISubscriptionLineItemChangeEvent,
  ISubscriptionOrderChangeEvent,
  ISubscriptionServiceChangeEvent,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import {
  IBillableService,
  IPurchaseOrder,
  IServiceDaysOfWeek,
  ISubscriptionProration,
  OrderTaxDistrict,
} from '@root/types';
import { IFrequency, ServiceFrequencyAggregated } from '@root/types/entities/frequency';

import { FileWithPreview } from '../base';
import { VersionedEntity } from '../helpers/VersionedEntity';

import { IBusinessLine } from './businessLine';
import { IBusinessUnit } from './businessUnit';
import { IContact } from './contact';
import { ICustomer } from './customer';
import { ICustomerJobSitePair } from './customerJobSitePair';
import { IEntity } from './entity';
import { EquipmentItemType, IEquipmentItem } from './equipmentItem';
import { IGlobalRateService } from './globalRate';
import { IJobSite } from './jobSite';
import { IMaterial } from './material';
import {
  IOrderCustomRatesGroupService,
  IOrderIncludedLineItem,
  IOrderThreshold,
  OrderCancellationReasonType,
} from './order';
import { IPermit } from './permit';
import { IPriceGroup } from './priceGroup';
import { IPromo } from './promo';
import { IServiceArea } from './serviceArea';
import { IServiceItem } from './serviceItem';
import { IThirdPartyHauler } from './thirdPartyHauler';
import { IUser } from './user';
import { IWorkOrder } from './workOrder';

export interface ISubscription extends IEntity {
  businessUnit: IBusinessUnit;
  businessLine: IBusinessLine;
  jobSite: VersionedEntity<IJobSite>;
  customer: VersionedEntity<ICustomer>;
  csr: VersionedEntity<IUser>;
  creditCard?: VersionedEntity<ICreditCard>;
  jobSiteContact: VersionedEntity<IContact>;
  csrEmail: string;
  beforeTaxesTotal: number;
  bestTimeToComeFrom: string;
  bestTimeToComeTo: string;
  billableLineItemsTotal: number;
  billableServicePrice: number;
  billableServiceTotal: number;
  cancellationComment: string | null;
  cancellationReasonType: OrderCancellationReasonType | null;
  driverInstructions: string | null;
  grandTotal: number;
  billingType: BillingTypeEnum;
  billingCycle: BillingCycleEnum;
  anniversaryBilling: boolean;
  nextBillingPeriodTo: Date | null;
  nextBillingPeriodFrom: Date | null;
  nextServiceDate: Date;
  highPriority: boolean;
  initialGrandTotal: number;
  callOnWayPhoneNumber: string | null;
  textOnWayPhoneNumber: string | null;
  jobSiteNote: string | null;
  purchaseOrder: IPurchaseOrder | null;
  rescheduleComment: string | null;
  thresholdsTotal: number;
  unapprovedComment: string | null;
  unfinalizedComment: string | null;
  csrComment: string | null;
  invoiceNotes: string | null;
  sendReceipt: boolean;
  deferred: boolean;
  material: VersionedEntity<IMaterial> | null;
  unlockOverrides: boolean;
  jobSiteContactTextOnly: boolean;
  startDate: Date;
  endDate: Date | null;
  minBillingPeriods: number | null;
  serviceName: EquipmentItemType;
  serviceItems: IServiceItem[];
  status: SubscriptionStatusEnum;
  subscriptionContact: VersionedEntity<IContact>;
  lineItems: IOrderIncludedLineItem[];
  oneTimeOrdersSequenceIds: number[];
  holdSubscriptionUntil: Date | null;
  reason: string | null;
  reasonDescription: string | null;

  customRatesGroupId?: number;
  someoneOnSite?: boolean;
  customerJobSite?: VersionedEntity<ICustomerJobSitePair>;
  serviceArea?: IServiceArea;
  thirdPartyHauler?: VersionedEntity<IThirdPartyHauler>;
  workOrder?: IWorkOrder;
  globalRatesServices?: VersionedEntity<IGlobalRateService>;
  billableService?: VersionedEntity<IBillableService>;
  equipmentItem?: VersionedEntity<IEquipmentItem>;
  customRatesGroup?: VersionedEntity<IPriceGroup>;
  promo?: VersionedEntity<IPromo>;
  permit?: VersionedEntity<IPermit>;
  thresholds?: IOrderThreshold[];
  customRatesGroupServices?: VersionedEntity<IOrderCustomRatesGroupService>;
  ticketFile?: FileWithPreview;
  taxDistricts?: OrderTaxDistrict[];
  serviceFrequencyAggregated?: ServiceFrequencyAggregated;
  currentSubscriptionPrice?: string;
  proration?: ISubscriptionProration;
  invoicedDate?: Date | null;
  recurringGrandTotal?: number;
}

export interface IConfigurableSubscription extends IEntity, Partial<ISubscriptionOnHoldDetails> {
  customerId: number;
  jobSiteContactId: number;
  jobSiteContactTextOnly: boolean;
  driverInstructions: string | null;
  permitId: number | null;
  bestTimeToComeFrom: string | Date | null;
  bestTimeToComeTo: string | Date | null;
  someoneOnSite: boolean;
  highPriority: boolean;
  thirdPartyHaulerId: number | null;
  subscriptionContactId: number;
  startDate: Date;
  endDate: Date | null;
  unlockOverrides: boolean;
  promoId: number | null;
  grandTotal: number;
  recurringGrandTotal: number;
  overrideCreditLimit: boolean;
  csrComment: string | null;
  customRatesGroupId?: number | null;
  serviceItems?: ISubscriptionServiceChangeEvent[];
  lineItems?: ISubscriptionLineItemChangeEvent[];
  subscriptionOrders?: ISubscriptionOrderChangeEvent[];
  onHold?: boolean;
  offHold?: boolean;
  periodFrom?: Date;
  periodTo?: Date;
  purchaseOrderId?: number;
  purchaseOrder?: IPurchaseOrder | null;
  oneTimePurchaseOrderNumber?: string;
}

export interface ISanitizedServiceItem
  extends Omit<ISubscriptionServiceChangeEvent, 'serviceDaysOfWeek'> {
  serviceDaysOfWeek?: IServiceDaysOfWeek;
}

export interface ISanitizedConfigurableSubscription
  extends Omit<IConfigurableSubscription, 'serviceItems'> {
  bestTimeToComeFrom: string | null;
  bestTimeToComeTo: string | null;
  serviceItems?: ISanitizedServiceItem[];
}

export enum SubscriptionStatusEnum {
  Active = 'active',
  OnHold = 'onHold',
  Closed = 'closed',
}

export interface IInvoicingSubscription
  extends Omit<ISubscription, 'type' | 'jobSite' | 'customer'> {
  jobSite: IJobSite;
}

export interface ISubscriptionOnHoldDetails {
  reason: string;
  reasonDescription: string | null;
  holdSubscriptionUntil: Date | null;
  updateOnly?: boolean;
}

export interface ISubscriptionsAvailableFilters {
  businessLine: number[];
  billingCycle: BillingCycleEnum[];
  serviceFrequency: IFrequency[];
}
