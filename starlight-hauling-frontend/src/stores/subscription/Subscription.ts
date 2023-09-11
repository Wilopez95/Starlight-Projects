import { action, computed, observable } from 'mobx';

import { BillingCycleEnum, BillingTypeEnum } from '@root/consts';
import {
  addressFormat,
  addressFormatShort,
  substituteLocalTimeZoneInsteadUTC,
} from '@root/helpers';
import { type ICreditCard } from '@root/modules/billing/types';
import {
  EquipmentItemType,
  FileWithPreview,
  IBillableService,
  IBusinessLine,
  IBusinessUnit,
  IContact,
  ICustomer,
  ICustomerJobSitePair,
  IEquipmentItem,
  IGlobalRateService,
  IJobSite,
  IMaterial,
  IOrderCustomRatesGroupService,
  IOrderIncludedLineItem,
  IOrderThreshold,
  IPermit,
  IPriceGroup,
  IPromo,
  IPurchaseOrder,
  IServiceArea,
  IServiceItem,
  ISubscription,
  ISubscriptionProration,
  IThirdPartyHauler,
  IUser,
  IWorkOrder,
  JsonConversions,
  OrderCancellationReasonType,
  OrderTaxDistrict,
  SubscriptionStatusEnum,
  VersionedEntity,
} from '@root/types';
import { ServiceFrequencyAggregated } from '@root/types/entities/frequency';

import { BaseEntity } from '../base/BaseEntity';

import {
  convertServiceFrequency,
  convertServiceItemDates,
  convertSubscriptionDates,
  getSubscriptionColorByStatus,
} from './helpers';
import { SubscriptionStore } from './SubscriptionStore';

export class Subscription extends BaseEntity implements ISubscription {
  businessUnit: IBusinessUnit;
  businessLine: IBusinessLine;
  jobSite: VersionedEntity<IJobSite>;
  customer: VersionedEntity<ICustomer>;
  csr: VersionedEntity<IUser>;
  csrEmail: string;
  creditCard?: VersionedEntity<ICreditCard>;
  jobSiteContact: VersionedEntity<IContact>;
  beforeTaxesTotal: number;
  bestTimeToComeFrom: string;
  bestTimeToComeTo: string;
  billableLineItemsTotal: number;
  billableServicePrice: number;
  billableServiceTotal: number;
  minBillingPeriods: number | null;
  cancellationComment: string | null;
  cancellationReasonType: OrderCancellationReasonType | null;
  driverInstructions: string | null;
  grandTotal: number;
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
  serviceName: EquipmentItemType;
  serviceItems: IServiceItem[];
  subscriptionContact: VersionedEntity<IContact>;
  lineItems: IOrderIncludedLineItem[];
  oneTimeOrdersSequenceIds: number[];

  reason: string | null;
  reasonDescription: string | null;
  holdSubscriptionUntil: Date | null;

  billingCycle: BillingCycleEnum;
  billingType: BillingTypeEnum;
  anniversaryBilling: boolean;
  nextBillingPeriodTo: Date | null;
  nextBillingPeriodFrom: Date | null;
  nextServiceDate: Date;

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

  store: SubscriptionStore;

  @observable checked = false;
  @observable status: SubscriptionStatusEnum;

  constructor(store: SubscriptionStore, entity: JsonConversions<ISubscription>) {
    super(entity);

    const subscription = convertSubscriptionDates(entity);

    this.csrComment = subscription.csrComment;
    this.invoiceNotes = subscription.invoiceNotes;
    this.callOnWayPhoneNumber = subscription.callOnWayPhoneNumber;
    this.textOnWayPhoneNumber = subscription.textOnWayPhoneNumber;
    this.beforeTaxesTotal = subscription.beforeTaxesTotal;
    this.grandTotal = subscription.grandTotal;
    this.billingType = subscription.billingType;
    this.billingCycle = subscription.billingCycle;
    this.anniversaryBilling = subscription.anniversaryBilling;
    this.nextBillingPeriodTo = subscription.nextBillingPeriodTo;
    this.nextBillingPeriodFrom = subscription.nextBillingPeriodFrom;
    this.nextServiceDate = subscription.nextServiceDate;
    this.driverInstructions = subscription.driverInstructions;
    this.highPriority = subscription.highPriority;
    this.customRatesGroupId = subscription.customRatesGroupId;
    this.cancellationReasonType = subscription.cancellationReasonType;
    this.cancellationComment = subscription.cancellationComment;
    this.unapprovedComment = subscription.unapprovedComment;
    this.unfinalizedComment = subscription.unfinalizedComment;
    this.rescheduleComment = subscription.rescheduleComment;
    this.jobSiteNote = subscription.jobSiteNote;
    this.driverInstructions = subscription.driverInstructions;
    this.billableServiceTotal = subscription.billableServiceTotal;
    this.billableLineItemsTotal = subscription.billableLineItemsTotal;
    this.billableServicePrice = subscription.billableServicePrice;
    this.thresholdsTotal = subscription.thresholdsTotal;
    this.initialGrandTotal = subscription.initialGrandTotal;
    this.purchaseOrder = subscription.purchaseOrder;
    this.bestTimeToComeFrom = subscription.bestTimeToComeFrom;
    this.bestTimeToComeTo = subscription.bestTimeToComeTo;
    this.sendReceipt = subscription.sendReceipt;
    this.invoicedDate = subscription.invoicedDate;

    this.someoneOnSite = subscription.someoneOnSite;
    this.jobSiteContact = subscription.jobSiteContact;
    this.jobSite = subscription.jobSite;
    this.customer = subscription.customer;
    this.billableService = subscription.billableService;
    this.customRatesGroup = subscription.customRatesGroup;
    this.csr = subscription.csr;
    this.csrEmail = subscription.csrEmail;
    this.material = subscription.material;
    this.globalRatesServices = subscription.globalRatesServices;
    this.customRatesGroupServices = subscription.customRatesGroupServices;
    this.lineItems = subscription.lineItems;
    this.thresholds = subscription.thresholds;
    this.customerJobSite = subscription.customerJobSite;
    this.thirdPartyHauler = subscription.thirdPartyHauler;
    this.permit = subscription.permit;
    this.promo = subscription.promo;
    this.taxDistricts = subscription.taxDistricts;
    this.equipmentItem = subscription.equipmentItem;

    this.workOrder = subscription.workOrder;

    this.checked = false;
    this.unlockOverrides = subscription.unlockOverrides;
    this.creditCard = subscription.creditCard;

    this.businessUnit = subscription.businessUnit;
    this.businessLine = subscription.businessLine;
    this.serviceArea = subscription.serviceArea;
    this.deferred = subscription.deferred;
    this.currentSubscriptionPrice = subscription.currentSubscriptionPrice;

    this.store = store;
    this.jobSiteContactTextOnly = false;
    this.startDate = subscription.startDate;
    this.endDate = subscription.endDate;
    this.minBillingPeriods = subscription.minBillingPeriods;
    this.serviceFrequencyAggregated = convertServiceFrequency(entity.serviceFrequencyAggregated);
    this.serviceName = entity.serviceName;
    this.subscriptionContact = subscription.subscriptionContact;
    this.serviceItems = entity.serviceItems?.map(convertServiceItemDates) || [];
    this.status = entity.status || SubscriptionStatusEnum.Active;
    this.oneTimeOrdersSequenceIds = entity.oneTimeOrdersSequenceIds;
    this.reason = entity.reason;
    this.reasonDescription = entity.reasonDescription;
    this.holdSubscriptionUntil = entity.holdSubscriptionUntil
      ? substituteLocalTimeZoneInsteadUTC(entity.holdSubscriptionUntil)
      : null;
    this.recurringGrandTotal = entity.recurringGrandTotal;
  }

  @action.bound check() {
    this.checked = !this.checked;
  }

  @computed get csrName() {
    if (!this.csr) {
      return 'Root';
    }

    return this.csr.firstName && this.csr.lastName
      ? `${this.csr.firstName} ${this.csr.lastName}`
      : this.csr.name;
  }

  @computed get customerName() {
    return this.customer?.businessName ?? this.customer?.name;
  }

  @computed get jobSiteAddress() {
    //TODO fix this
    if (!this.jobSite) {
      return '';
    }

    return addressFormat(this.jobSite.address);
  }

  @computed get jobSiteShortAddress() {
    //TODO fix this
    if (!this.jobSite) {
      return '';
    }

    return addressFormatShort(this.jobSite.address);
  }

  @computed get billableServiceDescription() {
    if (!this.billableService) {
      return 'No billable service';
    }

    const materialDescription = this.material?.description ? `・ ${this.material.description}` : '';

    return `${this.billableService.description}${materialDescription}`;
  }

  @computed get contactName() {
    if (!this.subscriptionContact) {
      return undefined;
    }

    const { firstName, lastName } = this.subscriptionContact;

    return `${firstName} ${lastName}`;
  }

  @computed get contactPhone() {
    return this.subscriptionContact?.phoneNumbers?.find(phoneNumber => phoneNumber.type === 'main')
      ?.number;
  }

  @computed get priceGroup() {
    return this.customRatesGroup?.description ?? 'General Price Group';
  }

  @computed get colorByStatus() {
    return getSubscriptionColorByStatus(this.status);
  }

  @computed get isActive() {
    return this.status === SubscriptionStatusEnum.Active;
  }

  @computed get isOnHold() {
    return this.status === SubscriptionStatusEnum.OnHold;
  }

  @computed get isClosed() {
    return this.status === SubscriptionStatusEnum.Closed;
  }

  @computed get permitRequired() {
    return this.customerJobSite?.permitRequired;
  }

  @computed get poRequired() {
    return this.customerJobSite?.poRequired;
  }

  @computed get signatureRequired() {
    return this.customerJobSite?.signatureRequired;
  }

  @computed get alleyPlacement() {
    return this.customerJobSite?.alleyPlacement;
  }
}
