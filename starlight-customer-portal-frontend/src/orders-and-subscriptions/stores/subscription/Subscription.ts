import { action, computed, observable } from 'mobx';

import { BillingCycleEnum, BillingTypeEnum } from '@root/core/consts';
import { addressFormat, addressFormatShort, parseDate } from '@root/core/helpers';
import { BaseEntity } from '@root/core/stores/base/BaseEntity';
import {
  EquipmentItemType,
  FileWithPreview,
  IBusinessLine,
  IBusinessUnit,
  IContact,
  ICreditCard,
  ICustomerJobSitePair,
  IEquipmentItem,
  IFrequency,
  IGlobalRateService,
  IJobSite,
  IMaterial,
  IPermit,
  IPriceGroup,
  IPromo,
  IServiceArea,
  IServiceItem,
  ISubscription,
  IThirdPartyHauler,
  IUser,
  IWorkOrder,
  JsonConversions,
  ServiceFrequencyAggregated,
  SubscriptionStatusEnum,
  VersionedEntity,
} from '@root/core/types';
import { IResponseBillableService } from '@root/core/types/responseEntities';
import { ICustomer } from '@root/customer/types';
import {
  IOrderCustomRatesGroupService,
  IOrderIncludedLineItem,
  IOrderThreshold,
  ManuallyCreatablePayment,
  OrderCancellationReasonType,
  OrderTaxDistrict,
  PaymentMethod,
} from '@root/finance/types/entities';

import { convertSubscriptionDates, getSubscriptionColorByStatus } from './helpers';
import { SubscriptionStore } from './SubscriptionStore';

export class Subscription extends BaseEntity implements ISubscription {
  businessUnit: IBusinessUnit;
  businessLine: IBusinessLine;
  jobSite: VersionedEntity<IJobSite>;
  customer: VersionedEntity<ICustomer>;
  csr: VersionedEntity<IUser>;
  creditCard?: VersionedEntity<ICreditCard>;
  jobSiteContact: VersionedEntity<IContact>;
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
  highPriority: boolean;
  initialGrandTotal: number;
  callOnWayPhoneNumber: string | null;
  textOnWayPhoneNumber: string | null;
  jobSiteNote: string | null;
  purchaseOrder: string | null;
  rescheduleComment: string | null;
  thresholdsTotal: number;
  unapprovedComment: string | null;
  unfinalizedComment: string | null;
  csrNotes: string | null;
  invoiceNotes: string | null;
  sendReceipt: boolean;
  deferred: boolean;
  material: VersionedEntity<IMaterial> | null;
  paymentMethod: PaymentMethod;
  jobSiteContactTextOnly: boolean;
  startDate: Date;
  endDate: Date | null;
  serviceName: EquipmentItemType;
  serviceItems: IServiceItem[];
  route: string;
  subscriptionContact: VersionedEntity<IContact>;
  lineItems: IOrderIncludedLineItem[];
  oneTimeOrdersIds: number[];
  serviceFrequencyAggregated?: ServiceFrequencyAggregated;

  someoneOnSite?: boolean;
  customerJobSite?: VersionedEntity<ICustomerJobSitePair>;
  serviceArea?: IServiceArea;
  thirdPartyHauler?: VersionedEntity<IThirdPartyHauler>;
  workOrder?: IWorkOrder;
  globalRatesServices?: VersionedEntity<IGlobalRateService>;
  billableService?: VersionedEntity<IResponseBillableService>;
  customRatesGroup?: VersionedEntity<IPriceGroup>;
  promo?: VersionedEntity<IPromo>;
  permit?: VersionedEntity<IPermit>;
  thresholds?: IOrderThreshold[];
  customRatesGroupServices?: VersionedEntity<IOrderCustomRatesGroupService>;
  ticketFile?: FileWithPreview;
  taxDistricts?: OrderTaxDistrict[];
  overrideCreditLimit?: boolean;
  payments?: ManuallyCreatablePayment[];
  serviceFrequency?: IFrequency;
  serviceDaysOfWeek?: Record<string, string>;

  billingType: BillingTypeEnum;
  billingCycle: BillingCycleEnum;
  nextBillingPeriodFrom: Date;
  nextBillingPeriodTo: Date;

  store: SubscriptionStore;

  @observable checked = false;
  @observable status: SubscriptionStatusEnum;

  constructor(store: SubscriptionStore, entity: JsonConversions<ISubscription>) {
    super(entity);

    entity.payments?.forEach((payment) => {
      if (payment?.deferredUntil) {
        payment.deferredUntil = (parseDate(payment.deferredUntil) as unknown) as string;
      }
    });

    const subscription = convertSubscriptionDates(entity);

    this.csrNotes = subscription.csrNotes;
    this.invoiceNotes = subscription.invoiceNotes;
    this.callOnWayPhoneNumber = subscription.callOnWayPhoneNumber;
    this.textOnWayPhoneNumber = subscription.textOnWayPhoneNumber;
    this.beforeTaxesTotal = subscription.beforeTaxesTotal;
    this.grandTotal = subscription.grandTotal;
    this.driverInstructions = subscription.driverInstructions;
    this.highPriority = subscription.highPriority;
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
    this.billingType = subscription.billingType;
    this.billingCycle = subscription.billingCycle;
    this.nextBillingPeriodFrom = subscription.nextBillingPeriodFrom;
    this.nextBillingPeriodTo = subscription.nextBillingPeriodTo;

    this.someoneOnSite = subscription.someoneOnSite;
    this.jobSiteContact = subscription.jobSiteContact;
    this.jobSite = subscription.jobSite;
    this.customer = subscription.customer;
    this.billableService = subscription.billableService;
    this.customRatesGroup = subscription.customRatesGroup;
    this.csr = subscription.csr;
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

    this.workOrder = subscription.workOrder;

    this.checked = false;
    this.paymentMethod = subscription.paymentMethod;
    this.creditCard = subscription.creditCard;

    this.businessUnit = subscription.businessUnit;
    this.businessLine = subscription.businessLine;
    this.serviceArea = subscription.serviceArea;
    this.deferred = subscription.deferred;
    this.payments = subscription.payments ?? [];

    this.store = store;
    this.jobSiteContactTextOnly = false;
    this.startDate = subscription.startDate;
    this.endDate = subscription.endDate;
    this.serviceFrequencyAggregated = entity.serviceFrequencyAggregated;
    this.serviceFrequency = entity.serviceFrequency;
    this.serviceName = entity.serviceName;
    this.subscriptionContact = subscription.subscriptionContact;
    this.serviceItems = subscription.serviceItems;
    this.status = entity.status || SubscriptionStatusEnum.Active;
    this.route = entity.route || '';
    this.serviceDaysOfWeek = entity.serviceDaysOfWeek;
    this.oneTimeOrdersIds = entity.oneTimeOrdersIds;
  }

  @action.bound check() {
    this.checked = !this.checked;
  }

  @computed get equipmentItem(): IEquipmentItem | undefined {
    return this.billableService?.equipmentItem;
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
    return this.subscriptionContact?.phoneNumbers?.find(
      (phoneNumber) => phoneNumber.type === 'main',
    )?.number;
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
