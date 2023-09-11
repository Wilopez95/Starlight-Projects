import { BestTimeToCome } from '@root/components/OrderTimePicker/types';
import { BillableItemActionEnum, UpdateSubscriptionItemType } from '@root/consts';
import {
  ISubscriptionOrderLineItem,
  SubscriptionOrderOption,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { RequestOptions } from '@root/stores/subscriptionOrder/types';
import { FileWithPreview, IPurchaseOrder, ISurcharge, OrderTaxDistrict } from '@root/types';

import { VersionedEntity } from '../../helpers';
import {
  IBusinessLine,
  ICustomer,
  IJobSite,
  IMaterial,
  IPermit,
  IPriceGroup,
  IPromo,
  OrderCancellationReasonType,
} from '..';
import { IBillableService } from '../billableService';
import { IContact } from '../contact';
import { IEntity } from '../entity';
import { SubscriptionOrderServiceItem } from '../serviceItem';

export interface ISubscriptionOrder extends IEntity {
  sequenceId: string;
  billableServiceId: number;
  billableService: VersionedEntity<IBillableService>;
  material: VersionedEntity<IMaterial> | null;
  globalRatesServicesId: number | null;
  customRatesGroupServicesId: number;
  serviceDate: Date;
  price: number;
  quantity: number;
  callOnWayPhoneNumber: string | null;
  textOnWayPhoneNumber: string | null;
  comments: boolean;
  canReschedule: boolean;
  subscriptionServiceItemId: number;
  oneTime: boolean;
  poRequired: boolean;
  permitRequired: boolean;
  signatureRequired: boolean;
  instructionsForDriver: string | null;
  jobSiteNote: string | null;
  jobSiteContactTextOnly: boolean;
  jobSiteContactId: number;
  bestTimeToComeFrom: string | null;
  bestTimeToComeTo: string | null;
  highPriority: boolean;
  hasAssignedRoutes: boolean;
  assignedRoute: string;
  startedAt: Date | null;
  canceledAt: Date | null;
  completedAt: Date | null;
  permitId: number | null;
  promoId: number | null;
  grandTotal: number | null;
  thirdPartyHaulerId: number | null;
  thirdPartyHaulerDescription?: string;
  earlyPick: boolean;
  unlockOverrides: boolean;
  workOrdersCount: number;
  status: SubscriptionOrderStatusEnum;
  subscriptionServiceItem: SubscriptionOrderServiceItem;
  subscriptionContactId: number;
  purchaseOrder: IPurchaseOrder | null;
  purchaseOrderId: number | null;
  customRatesGroupId: number | null;
  someoneOnSite: boolean;
  toRoll: boolean;
  alleyPlacement: boolean;
  uncompletedComment: string | null;
  unapprovedComment: string | null;
  unfinalizedComment: string | null;
  applySurcharges: boolean;
  customer?: VersionedEntity<ICustomer>;
  businessLine?: IBusinessLine;
  jobSite?: VersionedEntity<IJobSite>;
  promo?: VersionedEntity<IPromo>;
  jobSiteContact?: VersionedEntity<IContact>;
  subscriptionContact?: VersionedEntity<IContact>;
  eventType?: UpdateSubscriptionItemType;
  readOnly?: boolean;
  action?: string;
  lineItems: ISubscriptionOrderLineItem[];
  newLineItems?: ISubscriptionOrderLineItem[];
  noBillableService?: boolean;
  invoiceNotes?: string;
  permit?: VersionedEntity<IPermit>;
  customRatesGroup?: VersionedEntity<IPriceGroup>;
  billableLineItemsTotal?: number;
  truck?: string;
  truckNumbers?: string[];
  assignedRoutes?: string[];
  droppedEquipmentItem?: string;
  droppedEquipmentItems?: string[];
  pickedUpEquipmentItem?: string;
  pickedUpEquipmentItems?: string[];
  weight?: number;
  weightUnit?: string | null;
  arrivedAt?: Date;
  startServiceDate?: Date;
  finishWorkOrderDate?: Date;
  mediaFiles?: Array<ISubscriptionOrderMediaFile>;
  cancellationReason?: OrderCancellationReasonType;
  cancellationComment?: string;
  destinationJobSite?: VersionedEntity<IJobSite>;
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
  subscriptionOrderOptions: SubscriptionOrderOption[];
}

export interface IConfigurableSubscriptionOrder
  extends IEntity,
    Pick<
      ISubscriptionOrder,
      | 'serviceDate'
      | 'callOnWayPhoneNumber'
      | 'textOnWayPhoneNumber'
      | 'alleyPlacement'
      | 'jobSiteNote'
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
      | 'toRoll'
      | 'subscriptionContactId'
      | 'subscriptionContact'
      | 'promoId'
      | 'promo'
      | 'grandTotal'
      | 'instructionsForDriver'
      | 'businessLine'
      | 'truck'
      | 'weight'
      | 'weightUnit'
      | 'arrivedAt'
      | 'startServiceDate'
      | 'finishWorkOrderDate'
      | 'invoiceNotes'
      | 'unapprovedComment'
      | 'unfinalizedComment'
      | 'subscriptionId'
    > {
  businessLineId: number;
  status: SubscriptionOrderStatusEnum;
  customerId: number;
  jobSiteId: number | null;
  isOneTimePO: boolean;
  applySurcharges: boolean;
  billableLineItemsTotal?: number;
  globalRatesServicesId?: number | null;
  bestTimeToCome?: BestTimeToCome;
  assignedRoute?: string | null;
  quantity?: number;
  customRatesGroupServicesId?: number;
  customRatesGroupId?: number;
  price?: number;
  purchaseOrder?: IPurchaseOrder | null;
  purchaseOrderId?: number;
  oneTimePurchaseOrderNumber?: string | null;
  permitId?: number | null;
  thirdPartyHaulerId?: number | null;
  unlockOverrides?: boolean;
  materialId?: number;
  billableServiceId?: number;
  equipmentItemId?: number;
  lineItems: ISubscriptionOrderLineItem[];
  newLineItems?: ISubscriptionOrderLineItem[];
  noBillableService?: boolean;
  permit?: VersionedEntity<IPermit>;
  customRatesGroup?: VersionedEntity<IPriceGroup>;
  overrideCreditLimit: boolean;
  surcharges: ISurcharge[];
  driverInstructions?: string;
  billableService?: VersionedEntity<IBillableService>;
  startedAt?: Date;
  completionDate?: Date;
  completionTime?: Date;
  mediaFiles?: (ISubscriptionOrderMediaFile | FileWithPreview)[];
  taxDistricts?: OrderTaxDistrict[];
  customerName?: string;
  jobSiteAddress?: string;
  searchString?: string;
  jobSite2Label?: string;
  jobSite2Id?: number;
  jobSite2Address?: string;
  destinationJobSite?: VersionedEntity<IJobSite>;
  destinationJobSiteId?: number;
  destinationJobSiteLabel?: string;
  droppedEquipmentItem?: string | null;
  pickedUpEquipmentItem?: string | null;
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
  subscriptionContact?: VersionedEntity<IContact>;
  subscriptionOrderOptions: SubscriptionOrderOption[];
}

export type ITransitionSubscriptionOrderStatus = Pick<
  IConfigurableSubscriptionOrder,
  | 'noBillableService'
  | 'materialId'
  | 'promoId'
  | 'instructionsForDriver'
  | 'billableServiceId'
  | 'grandTotal'
  | 'overrideCreditLimit'
> & {
  invoiceNotes: string | null;
  lineItems: ISubscriptionOrderLineItem[];
  images: File[];
  action?: BillableItemActionEnum;
  completionFields?: {
    completedAt: string | null;
    droppedEquipmentItem: string | null;
    pickedUpEquipmentItem: string | null;
    weight: number | null;
    weightUnit: string | null;
    startedAt: string | null;
    arrivedAt: string | null;
    startServiceDate: string | null;
    finishWorkOrderDate: string | null;
    mediaFiles: ISubscriptionOrderMediaFile[];
    route?: string | null;
    truck?: string | null;
  };
};

export interface ISubscriptionOrderMediaFile extends IEntity {
  url: string;
  author: string | null;
  fileName: string | null;
}

export enum SubscriptionOrderStatusEnum {
  scheduled = 'SCHEDULED',
  inProgress = 'IN_PROGRESS',
  completed = 'COMPLETED',
  needsApproval = 'NEEDS_APPROVAL',
  blocked = 'BLOCKED',
  skipped = 'SKIPPED',
  canceled = 'CANCELED',
  approved = 'APPROVED',
  finalized = 'FINALIZED',
  invoiced = 'INVOICED',
}

export interface IRevertCompletedStatus {
  comment?: string;
  status: SubscriptionOrderStatusEnum;
}

export interface IUnFinalizedSubscriptionOrder {
  customerId: number;
  grandTotal: number;
  orderId: number;
  ordersCount: number;
  serviceDate: Date;
  status: SubscriptionOrderStatusEnum;
  subscriptionId: number;
}

export type INeedsApprovalOrApprovedStatus =
  | SubscriptionOrderStatusEnum.needsApproval
  | SubscriptionOrderStatusEnum.approved;

export type IApprovedOrFinalizedStatus =
  | SubscriptionOrderStatusEnum.approved
  | SubscriptionOrderStatusEnum.finalized;

export interface IValidateMultipleSubscriptionOrdersRequest {
  ids: number[] | null;
  options: RequestOptions;
  businessUnitId: number;
  status: INeedsApprovalOrApprovedStatus;
}

export interface IApproveOrFinalizeMultipleSubscriptionOrdersRequest {
  ids: number[] | null;
  businessUnitId: number;
  validOnly: boolean;
  status: IApprovedOrFinalizedStatus;
}
