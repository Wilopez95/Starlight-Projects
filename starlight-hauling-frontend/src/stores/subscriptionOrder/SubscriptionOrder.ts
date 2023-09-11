import { action, computed, observable } from 'mobx';

import {
  addressFormat,
  addressFormatShort,
  convertDates,
  parseDate,
  substituteLocalTimeZoneInsteadUTC,
} from '@root/helpers';
import {
  ISubscriptionOrderLineItem,
  SubscriptionOrderOption,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import {
  IBillableService,
  IBusinessLine,
  IContact,
  ICustomer,
  IJobSite,
  IMaterial,
  IPermit,
  IPriceGroup,
  IPromo,
  IPurchaseOrder,
  ISubscriptionOrder,
  ISubscriptionOrderMediaFile,
  JsonConversions,
  OrderCancellationReasonType,
  SubscriptionOrderServiceItem,
  SubscriptionOrderStatusEnum,
  VersionedEntity,
} from '@root/types';

import { BaseEntity } from '../base/BaseEntity';
import {
  convertPurchaseOrderDates,
  convertSubscriptionOrderServiceItemDates,
} from '../subscription/helpers';

import { getSubscriptionOrderStatusColor, getSubscriptionOrderStatusLabel } from './helpers';
import { SubscriptionOrderStore } from './SubscriptionOrderStore';

export class SubscriptionOrder extends BaseEntity implements ISubscriptionOrder {
  store: SubscriptionOrderStore;

  sequenceId: string;

  globalRatesServicesId: number | null;

  customRatesGroupServicesId: number;

  serviceDate: Date;

  price: number;

  quantity: number;

  callOnWayPhoneNumber: string | null;

  textOnWayPhoneNumber: string | null;

  comments: boolean;

  canReschedule: boolean;

  oneTime: boolean;

  poRequired: boolean;

  permitRequired: boolean;

  signatureRequired: boolean;

  instructionsForDriver: string | null;

  jobSiteNote: string | null;

  jobSiteContactTextOnly: boolean;

  bestTimeToComeFrom: string | null;

  bestTimeToComeTo: string | null;

  highPriority: boolean;

  hasAssignedRoutes: boolean;

  assignedRoute: string;

  startedAt: Date | null;

  canceledAt: Date | null;

  completedAt: Date | null;

  jobSiteContactId: number;

  permitId: number | null;

  promoId: number | null;

  grandTotal: number | null;

  thirdPartyHaulerId: number | null;

  thirdPartyHaulerDescription?: string;

  earlyPick: boolean;

  unlockOverrides: boolean;

  subscriptionServiceItem: SubscriptionOrderServiceItem;

  subscriptionServiceItemId: number;

  status: SubscriptionOrderStatusEnum;

  workOrdersCount: number;

  billableService: VersionedEntity<IBillableService>;

  billableServiceId: number;

  readOnly: boolean;

  subscriptionContactId: number;

  purchaseOrder: IPurchaseOrder | null;

  customRatesGroupId: number | null;

  someoneOnSite: boolean;

  toRoll: boolean;

  alleyPlacement: boolean;

  lineItems: ISubscriptionOrderLineItem[];

  uncompletedComment: string | null;

  unapprovedComment: string | null;

  unfinalizedComment: string | null;

  applySurcharges: boolean;

  material: VersionedEntity<IMaterial> | null;

  customer?: VersionedEntity<ICustomer>;

  jobSite?: VersionedEntity<IJobSite>;

  businessLine?: IBusinessLine;

  promo?: VersionedEntity<IPromo>;

  jobSiteContact?: VersionedEntity<IContact>;

  subscriptionContact?: VersionedEntity<IContact>;

  newLineItems?: ISubscriptionOrderLineItem[];

  noBillableService?: boolean;

  permit?: VersionedEntity<IPermit>;

  customRatesGroup?: VersionedEntity<IPriceGroup>;

  billableLineItemsTotal?: number;

  truck?: string;

  truckNumbers?: string[];

  droppedEquipmentItem?: string;

  droppedEquipmentItems?: string[];

  pickedUpEquipmentItem?: string;

  pickedUpEquipmentItems?: string[];

  invoiceNotes?: string;

  mediaFiles?: Array<ISubscriptionOrderMediaFile>;

  cancellationComment?: string;

  cancellationReason?: OrderCancellationReasonType;

  destinationJobSite?: VersionedEntity<IJobSite>;

  weight?: number;

  weightUnit?: string | null;

  assignedRoutes?: string[];

  addTripCharge?: boolean;

  billedAt?: Date;

  deletedAt?: Date;

  hasComments?: boolean;

  included?: boolean;

  invoicedDate?: Date;

  isFinalForService?: boolean;

  refactoredBeforeTaxesTotal?: number;

  refactoredBillableLineItemsTotal?: number;

  refactoredGrandTotal?: number;

  refactoredInvoicedAt?: Date;

  refactoredPaidAt?: Date;

  refactoredPrice?: number;

  refactoredPriceGroupHistoricalId?: number;

  refactoredPriceId?: number;

  refactoredSurchargesTotal?: number;

  serviceDayOfWeekRequiredByCustomer?: boolean;

  subscriptionId?: number;

  arrivedAt?: Date;

  purchaseOrderId: number | null;

  subscriptionOrderOptions: SubscriptionOrderOption[];

  @observable checked = false;

  constructor(store: SubscriptionOrderStore, entity: JsonConversions<ISubscriptionOrder>) {
    super(entity);

    this.store = store;

    this.sequenceId = entity.sequenceId;
    this.businessLine = convertDates(entity.businessLine);
    this.customer = convertDates(entity.customer);
    this.globalRatesServicesId = entity.globalRatesServicesId;
    this.customRatesGroupServicesId = entity.customRatesGroupServicesId;
    this.serviceDate = substituteLocalTimeZoneInsteadUTC(entity.serviceDate);
    this.price = entity.price;
    this.quantity = entity.quantity;
    this.callOnWayPhoneNumber = entity.callOnWayPhoneNumber;
    this.textOnWayPhoneNumber = entity.textOnWayPhoneNumber;
    this.comments = entity.comments;
    this.canReschedule = entity.canReschedule;
    this.oneTime = entity.oneTime;
    this.poRequired = entity.poRequired;
    this.permitRequired = entity.permitRequired;
    this.signatureRequired = entity.signatureRequired;
    this.instructionsForDriver = entity.instructionsForDriver;
    this.jobSite = convertDates(entity.jobSite);
    this.jobSiteNote = entity.jobSiteNote;
    this.jobSiteContactTextOnly = entity.jobSiteContactTextOnly;
    this.bestTimeToComeFrom = entity.bestTimeToComeFrom;
    this.bestTimeToComeTo = entity.bestTimeToComeTo;
    this.highPriority = entity.highPriority;
    this.hasAssignedRoutes = entity.hasAssignedRoutes;
    this.assignedRoute = entity.assignedRoute;
    this.assignedRoutes = entity.assignedRoutes;
    this.startedAt = substituteLocalTimeZoneInsteadUTC(entity.startedAt);
    this.canceledAt = substituteLocalTimeZoneInsteadUTC(entity.startedAt);
    this.completedAt = parseDate(entity.completedAt);
    this.jobSiteContactId = entity.jobSiteContactId;
    this.permitId = entity.permitId;
    this.permit = convertDates(entity.permit);
    this.promoId = entity.promoId;
    this.grandTotal = entity.grandTotal;
    this.thirdPartyHaulerId = entity.thirdPartyHaulerId;
    this.thirdPartyHaulerDescription = entity.thirdPartyHaulerDescription;
    this.earlyPick = entity.earlyPick;
    this.unlockOverrides = entity.unlockOverrides;
    this.status = entity.status;
    this.workOrdersCount = entity.workOrdersCount;
    this.subscriptionServiceItem = convertSubscriptionOrderServiceItemDates(
      entity.subscriptionServiceItem,
    );
    this.subscriptionServiceItemId = entity.subscriptionServiceItemId;
    this.billableServiceId = entity.billableServiceId;
    this.billableService = convertDates(entity.billableService);
    this.customRatesGroupId = entity.customRatesGroupId;
    this.subscriptionContactId = entity.subscriptionContactId;
    this.purchaseOrderId = entity.purchaseOrderId;
    this.purchaseOrder = entity.purchaseOrder
      ? convertPurchaseOrderDates(entity.purchaseOrder)
      : null;
    this.someoneOnSite = entity.someoneOnSite;
    this.toRoll = entity.toRoll;
    this.alleyPlacement = entity.alleyPlacement;
    this.applySurcharges = entity.applySurcharges;
    this.material = convertDates(entity.material);
    this.readOnly = true;
    this.subscriptionContact = convertDates(entity.subscriptionContact);
    this.jobSiteContact = convertDates(entity.jobSiteContact);
    this.lineItems = entity.lineItems;
    this.newLineItems = entity.newLineItems;
    this.noBillableService = entity.noBillableService;
    this.customRatesGroup = convertDates(entity.customRatesGroup);
    this.billableLineItemsTotal = entity.billableLineItemsTotal;
    this.truck = entity.truck;
    this.truckNumbers = entity.truckNumbers;
    this.droppedEquipmentItem = entity.droppedEquipmentItem;
    this.droppedEquipmentItems = entity.droppedEquipmentItems;
    this.pickedUpEquipmentItem = entity.pickedUpEquipmentItem;
    this.pickedUpEquipmentItems = entity.pickedUpEquipmentItems;
    this.invoiceNotes = entity.invoiceNotes;
    this.mediaFiles = entity.mediaFiles?.map(file => convertDates(file));
    this.uncompletedComment = entity.uncompletedComment;
    this.unapprovedComment = entity.unapprovedComment;
    this.unfinalizedComment = entity.unfinalizedComment;
    this.cancellationComment = entity.cancellationComment;
    this.cancellationReason = entity.cancellationReason;
    this.destinationJobSite = convertDates(entity.destinationJobSite);
    this.weight = entity.weight;
    this.weightUnit = entity.weightUnit;
    this.addTripCharge = entity.addTripCharge;
    this.arrivedAt = substituteLocalTimeZoneInsteadUTC(entity.arrivedAt);
    this.billedAt = substituteLocalTimeZoneInsteadUTC(entity.billedAt);
    this.deletedAt = substituteLocalTimeZoneInsteadUTC(entity.deletedAt);
    this.hasComments = entity.hasComments;
    this.included = entity.included;
    this.invoicedDate = substituteLocalTimeZoneInsteadUTC(entity.invoicedDate);
    this.isFinalForService = entity.isFinalForService;
    this.refactoredBeforeTaxesTotal = entity.refactoredBeforeTaxesTotal;
    this.refactoredBillableLineItemsTotal = entity.refactoredBillableLineItemsTotal;
    this.refactoredGrandTotal = entity.refactoredGrandTotal;
    this.refactoredInvoicedAt = substituteLocalTimeZoneInsteadUTC(entity.refactoredInvoicedAt);
    this.refactoredPaidAt = substituteLocalTimeZoneInsteadUTC(entity.refactoredPaidAt);
    this.refactoredPrice = entity.refactoredPrice;
    this.refactoredPriceGroupHistoricalId = entity.refactoredPriceGroupHistoricalId;
    this.refactoredPriceId = entity.refactoredPriceId;
    this.refactoredSurchargesTotal = entity.refactoredSurchargesTotal;
    this.serviceDayOfWeekRequiredByCustomer = entity.serviceDayOfWeekRequiredByCustomer;
    this.subscriptionId = entity.subscriptionId;
    this.subscriptionOrderOptions = entity.subscriptionOrderOptions;
  }

  @action.bound check() {
    this.checked = !this.checked;
  }

  @computed get jobSiteAddress() {
    // TODO fix this
    if (!this.jobSite) {
      return '';
    }

    return addressFormat(this.jobSite.address);
  }

  @computed get jobSiteShortAddress() {
    // TODO fix this
    if (!this.jobSite) {
      return '';
    }

    return addressFormatShort(this.jobSite.address);
  }

  @computed
  get statusLabel() {
    return getSubscriptionOrderStatusLabel(this.status);
  }

  @computed
  get statusColor() {
    return getSubscriptionOrderStatusColor(this.status);
  }

  @computed get isEquipmentEditable() {
    return [
      SubscriptionOrderStatusEnum.scheduled,
      SubscriptionOrderStatusEnum.inProgress,
      SubscriptionOrderStatusEnum.completed,
      SubscriptionOrderStatusEnum.approved,
    ].includes(this.status);
  }
}
