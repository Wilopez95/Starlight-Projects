import { computed } from 'mobx';

import { substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import {
  ISubscriptionOrderLineItem,
  ISubscriptionWorkOrderServiceItem,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import {
  IEntity,
  IPurchaseOrder,
  ISubscriptionWorkOrder,
  JsonConversions,
  SubscriptionWorkOrderStatusType,
} from '@root/types';

import { BaseEntity } from '../base/BaseEntity';
import {
  convertPurchaseOrderDates,
  convertWorkOrderServiceItemDates,
} from '../subscription/helpers/convertDates';

import {
  getSubscriptionWorkOrderStatusColor,
  getSubscriptionWorkOrderStatusLabel,
} from './helpers';
import { SubscriptionWorkOrderStore } from './SubscriptionWorkOrderStore';

export class SubscriptionWorkOrder extends BaseEntity implements ISubscriptionWorkOrder {
  store: SubscriptionWorkOrderStore;
  sequenceId: string;
  subscriptionOrderId: number;
  serviceDate: Date;
  assignedRoute: string;
  driverName: string;
  instructionsForDriver: string | null;
  jobSiteNote: string | null;
  commentFromDriver: string;
  status: SubscriptionWorkOrderStatusType;
  lineItems: ISubscriptionOrderLineItem[] = [];
  attachMedia: boolean;
  alleyPlacement: boolean;
  callOnWayPhoneNumber: string;
  textOnWayPhoneNumber: string;
  bestTimeToComeFrom: string;
  bestTimeToComeTo: string;
  poRequired: boolean;
  permitRequired: boolean;
  signatureRequired: boolean;
  jobSiteContactId: number;
  jobSiteContactTextOnly: string;
  highPriority: boolean;
  earlyPick: boolean;
  someoneOnSite: boolean;
  promoId: number;
  thirdPartyHaulerId: number | null;
  permitId: number | null;
  purchaseOrder: IPurchaseOrder | null;
  subscriptionContactId: number;
  customRatesGroupServicesId: number;
  subscriptionServiceItem: ISubscriptionWorkOrderServiceItem;
  billableLineItemsTotal: number;
  blockingReason?: string;
  droppedEquipmentItem?: string;
  pickedUpEquipmentItem?: string;

  constructor(store: SubscriptionWorkOrderStore, entity: JsonConversions<ISubscriptionWorkOrder>) {
    super(entity);
    this.store = store;
    this.sequenceId = entity.sequenceId;
    this.subscriptionOrderId = entity.subscriptionOrderId;
    this.assignedRoute = entity.assignedRoute;
    this.serviceDate = substituteLocalTimeZoneInsteadUTC(entity.serviceDate);
    this.driverName = entity.driverName;
    this.status = entity.status;
    this.instructionsForDriver = entity.instructionsForDriver;
    this.jobSiteNote = entity.jobSiteNote;
    this.commentFromDriver = entity.commentFromDriver;
    this.attachMedia = entity.attachMedia;
    this.alleyPlacement = entity.alleyPlacement;
    this.callOnWayPhoneNumber = entity.callOnWayPhoneNumber;
    this.textOnWayPhoneNumber = entity.textOnWayPhoneNumber;
    this.bestTimeToComeFrom = entity.bestTimeToComeFrom;
    this.bestTimeToComeTo = entity.bestTimeToComeTo;
    this.poRequired = entity.poRequired;
    this.permitRequired = entity.permitRequired;
    this.signatureRequired = entity.signatureRequired;
    this.jobSiteContactId = entity.jobSiteContactId;
    this.jobSiteContactTextOnly = entity.jobSiteContactTextOnly;
    this.highPriority = entity.highPriority;
    this.earlyPick = entity.earlyPick;
    this.someoneOnSite = entity.someoneOnSite;
    this.promoId = entity.promoId;
    this.thirdPartyHaulerId = entity.thirdPartyHaulerId;
    this.permitId = entity.permitId;
    this.purchaseOrder = entity.purchaseOrder
      ? convertPurchaseOrderDates(entity.purchaseOrder)
      : null;
    this.subscriptionContactId = entity.subscriptionContactId;
    this.customRatesGroupServicesId = entity.customRatesGroupServicesId;
    this.subscriptionServiceItem = convertWorkOrderServiceItemDates(entity.subscriptionServiceItem);
    this.lineItems = entity.lineItems;
    this.billableLineItemsTotal = entity.billableLineItemsTotal;
    this.blockingReason = entity.blockingReason;
    this.droppedEquipmentItem = entity.droppedEquipmentItem;
    this.pickedUpEquipmentItem = entity.pickedUpEquipmentItem;
  }

  @computed
  get statusLabel() {
    return getSubscriptionWorkOrderStatusLabel(this.status);
  }

  @computed
  get statusColor() {
    return getSubscriptionWorkOrderStatusColor(this.status);
  }
}

export interface IConfigurableSubscriptionWorkOrder
  extends IEntity,
    Pick<
      ISubscriptionWorkOrder,
      | 'serviceDate'
      | 'callOnWayPhoneNumber'
      | 'textOnWayPhoneNumber'
      | 'alleyPlacement'
      | 'jobSiteNote'
      | 'assignedRoute'
      | 'jobSiteContactId'
      | 'jobSiteContactTextOnly'
      | 'poRequired'
      | 'permitRequired'
      | 'signatureRequired'
      | 'bestTimeToComeFrom'
      | 'bestTimeToComeTo'
      | 'highPriority'
      | 'earlyPick'
      | 'someoneOnSite'
      | 'promoId'
      | 'instructionsForDriver'
      | 'customRatesGroupServicesId'
      | 'thirdPartyHaulerId'
      | 'permitId'
      | 'purchaseOrder'
      | 'subscriptionContactId'
    > {
  businessLineId: number;
  bestTimeToCome: string;
  quantity: number;
  billableServiceId: number;
  equipmentItemId: number;
  materialId: number;
  subscriptionServiceItem?: ISubscriptionWorkOrderServiceItem;
  lineItems: ISubscriptionOrderLineItem[];
  billableLineItemsTotal: number;
  isOneTimePO: boolean;
  customRatesGroupId?: number;
  droppedEquipmentItem?: string;
  pickedUpEquipmentItem?: string;
  purchaseOrderId?: number;
  oneTimePurchaseOrderNumber?: string;
}
