import { BestTimeToCome } from '@root/components/OrderTimePicker/types';
import {
  BillableItemActionEnum,
  BillableLineItemUnitTypeEnum,
  ClientRequestType,
} from '@root/consts';
import {
  type ICreditCard,
  type INewCreditCard,
  type ManuallyCreatablePayment,
  type PaymentMethod,
  type PaymentStatus,
  type PaymentType,
} from '@root/modules/billing/types';
import {
  type IBillableService,
  type IConfigurableReminderSchedule,
  type IContact,
  type IEditableWorkOrder,
  type IEntity,
  type IEquipmentItem,
  type IGlobalRateLineItem,
  type IGlobalRateService,
  type IGlobalRateThreshold,
  type IJobSite,
  type ILineItem,
  type IServiceArea,
  type ISurcharge,
  type ITaxDistrict,
  type IThreshold,
  IPurchaseOrder,
} from '@root/types';
import { FileWithPreview } from '../base';
import { type VersionedEntity } from '../helpers';

import { IBusinessLine } from './businessLine';
import { IBusinessUnit } from './businessUnit';
import { ICustomer } from './customer';
import { ICustomerJobSitePair } from './customerJobSitePair';
import { IDisposalSite } from './disposalSite';
import { ICustomRateLineItem, ICustomRateSurcharge, IGlobalRateSurcharge } from './globalRate';
import { IMaterial } from './material';
import { IMaterialProfile } from './materialProfile';
import { IPermit } from './permit';
import { IPriceGroup } from './priceGroup';
import { IProject } from './project';
import { IPromo } from './promo';
import { IThirdPartyHauler } from './thirdPartyHauler';
import { IUser } from './user';
import { IWorkOrder, IWorkOrderMediaFile, WorkOrderWeightUnit } from './workOrder';

export type OrderTaxDistrict = ITaxDistrict | Pick<ITaxDistrict, 'description' | 'districtName'>;

export interface IOrder extends IEntity {
  businessUnit: IBusinessUnit;
  businessLine: IBusinessLine;
  jobSite: VersionedEntity<IJobSite>;
  customer: VersionedEntity<ICustomer>;
  csr: VersionedEntity<IUser>;
  creditCard?: VersionedEntity<ICreditCard>;
  jobSiteContact: VersionedEntity<IContact>;
  jobSiteContactId: number;
  beforeTaxesTotal: number;
  bestTimeToComeFrom: string;
  bestTimeToComeTo: string;
  billableLineItemsTotal: number;
  billableServicePrice: number;
  billableServiceApplySurcharges?: boolean;
  billableServiceTotal: number;
  cancellationComment: string | null;
  cancellationReasonType: OrderCancellationReasonType | null;
  driverInstructions: string | null;
  earlyPick: boolean;
  grandTotal: number;
  highPriority: boolean;
  initialGrandTotal: number;
  callOnWayPhoneNumber: string | null;
  callOnWayPhoneNumberId: number | null;
  textOnWayPhoneNumber: string | null;
  textOnWayPhoneNumberId: number | null;
  jobSiteNote: string | null;
  purchaseOrder: IPurchaseOrder | null;
  rescheduleComment: string | null;
  serviceDate: Date;
  someoneOnSite: boolean;
  thresholdsTotal: number;
  toRoll: boolean;
  unapprovedComment: string | null;
  unfinalizedComment: string | null;
  invoiceNotes: string | null;
  droppedEquipmentItem: string | null;
  sendReceipt: boolean;
  notifyDayBefore: 'byText' | 'byEmail' | null;
  deferred: boolean;
  material: VersionedEntity<IMaterial> | null;
  paymentMethod: PaymentMethod;
  orderContact: VersionedEntity<IContact>;
  orderContactId: number;
  status: OrderStatusType;
  lineItems: IOrderIncludedLineItem[];
  surchargesTotal: number;
  manifestItems: IOrderManifestItem[];
  netWeight: number | null;
  graded: boolean;
  hasWeightTicket: boolean;
  commercialTaxesUsed: boolean;
  csrName: string;
  serviceArea?: IServiceArea;
  customerJobSite?: VersionedEntity<ICustomerJobSitePair>;
  thirdPartyHauler?: VersionedEntity<IThirdPartyHauler>;
  workOrder?: IWorkOrder;
  globalRatesServices?: VersionedEntity<IGlobalRateService>;
  globalRatesServicesId?: number | null;
  equipmentItem?: VersionedEntity<IEquipmentItem>;
  billableService?: VersionedEntity<IBillableService>;
  jobSite2?: VersionedEntity<IJobSite>;
  project?: VersionedEntity<IProject>;
  customRatesGroup?: VersionedEntity<IPriceGroup>;
  disposalSite?: VersionedEntity<IDisposalSite>;
  promo?: VersionedEntity<IPromo>;
  permit?: VersionedEntity<IPermit>;
  materialProfile?: VersionedEntity<IMaterialProfile>;
  thresholds?: IOrderThreshold[];
  customRatesGroupServices?: VersionedEntity<IOrderCustomRatesGroupService>;
  ticketFile?: FileWithPreview;
  taxDistricts?: OrderTaxDistrict[];
  surcharges?: IOrderSurcharge[];
  applySurcharges: boolean;
  overrideCreditLimit?: boolean;
  alleyPlacement?: boolean;
  cabOver?: boolean;
  payments?: ManuallyCreatablePayment[];
  route?: string;
  purchaseOrderId?: number;
  oneTimePurchaseOrderNumber?: string | null;
  landfillOperationId?: number;
}

export interface IConfigurableOrder
  extends IEntity,
    Pick<
      IOrder,
      | 'businessUnit'
      | 'businessLine'
      | 'status'
      | 'serviceDate'
      | 'someoneOnSite'
      | 'toRoll'
      | 'highPriority'
      | 'earlyPick'
      | 'bestTimeToComeFrom'
      | 'bestTimeToComeTo'
      | 'callOnWayPhoneNumber'
      | 'callOnWayPhoneNumberId'
      | 'textOnWayPhoneNumber'
      | 'textOnWayPhoneNumberId'
      | 'billableServicePrice'
      | 'billableServiceApplySurcharges'
      | 'grandTotal'
      | 'billableServiceTotal'
      | 'billableLineItemsTotal'
      | 'initialGrandTotal'
      | 'driverInstructions'
      | 'purchaseOrder'
      | 'rescheduleComment'
      | 'cancellationReasonType'
      | 'cancellationComment'
      | 'unfinalizedComment'
      | 'unapprovedComment'
      | 'invoiceNotes'
      | 'sendReceipt'
      | 'notifyDayBefore'
      | 'droppedEquipmentItem'
      | 'ticketFile'
      | 'paymentMethod'
      | 'orderContact'
      | 'promo'
      | 'globalRatesServices'
      | 'thirdPartyHauler'
      | 'taxDistricts'
      | 'surcharges'
      | 'applySurcharges'
      | 'manifestItems'
      | 'customRatesGroup'
      | 'purchaseOrderId'
      | 'oneTimePurchaseOrderNumber'
    > {
  customerId: number;
  jobSiteId: number;
  customerJobSiteId: number | null;
  alleyPlacement: boolean;
  cabOver: boolean;
  customerJobSitePairSignatureRequired: boolean;
  signatureRequired: boolean;
  orderContactId: number;
  poRequired: boolean;
  isOneTimePO: boolean;
  customerJobSitePairPermitRequired: boolean;
  permitRequired: boolean;
  jobSiteContactId: number;
  bestTimeToCome: BestTimeToCome;
  billableServiceId: number | null;
  materialId: number | null;
  globalRatesServicesId: number | null;
  billableServiceQuantity: number;
  equipmentItemId: number | null;
  jobSiteAddress: string;
  customerName: string;
  popupNote: string | null;
  lineItems: Omit<IOrderLineItem, keyof IEntity>[] | null;
  thresholds: IOrderThreshold[];
  projectId: number | null;
  customRatesGroupServicesId: number | null;
  permitId: number | null;
  disposalSiteId: number | null;
  customRatesGroupId: number | null;
  promoId: number | null;
  thirdPartyHaulerId: number | null;
  newManifestItems: IOrderNewManifestItem[];
  manifestFiles: File[];
  materialProfileId?: number | null;
  jobSite2Id?: number;
  jobSite2Address?: string;
  serviceArea?: IServiceArea;
  businessLineId?: number | null;
  businessUnitId?: number | null;

  // Historical data
  workOrder?: IEditableWorkOrder;
  equipmentItem?: VersionedEntity<IEquipmentItem>;
  billableService?: VersionedEntity<IBillableService>;
  material?: VersionedEntity<IMaterial> | null;
  overrideCreditLimit?: boolean;

  // UI props
  droppedEquipmentItemComment: string;
  noBillableService: boolean;
  notificationApplied: boolean;
  unlockOverrides: boolean;
  deferred: boolean;
  searchString?: string;
  droppedEquipmentItemApplied?: boolean;
  jobSite2Label?: string;
  type?: ClientRequestType;

  payments: {
    paymentId: number;
    paymentType: PaymentType;
    status: PaymentStatus;
    amount: number;
    deferredUntil?: Date;
    creditCardId?: number;
    creditCard?: ICreditCard | null;
    newCreditCard?: INewCreditCard;
    checkNumber?: string;
    isAch?: boolean;
    orders?: IOrder[];
  }[];

  globalRatesSurcharges?: IGlobalRateSurcharge[];
  customRatesSurcharges?: ICustomRateSurcharge[];
  annualReminderConfig?: IConfigurableReminderSchedule;
  route?: string;
}

export interface IConfigurableOrders {
  orders: IConfigurableOrder[];
}

export type OrderStatusType =
  | 'inProgress'
  | 'completed'
  | 'approved'
  | 'canceled'
  | 'finalized'
  | 'invoiced';

export type OrderStoreStatusType = Exclude<OrderStatusType, 'canceled'>;

export type OrderActionType =
  | 'complete'
  | 'cancel'
  | 'edit'
  | 'approve'
  | 'finalize'
  | 'unApprove'
  | 'unFinalize'
  | 'orderDetails'
  | 'invoiceDetails';

export type CompletedOrApproved = 'completed' | 'approved';
export type ScheduledOrInProgress = 'scheduled' | 'inProgress';

export type RevertToStatus = CompletedOrApproved | ScheduledOrInProgress;
export type RevertableStatus = CompletedOrApproved | 'finalized';

export type OrderAllStatusTypes = OrderStatusType | 'total';

export type OrderCancellationReasonType =
  | 'customerCanceled'
  | 'duplicateOrder'
  | 'schedulingError'
  | 'internalError'
  | 'canceledDueToOnHold'
  | 'other';

export interface IEditOrderPayment extends ManuallyCreatablePayment {
  paymentId?: number;
}

export interface IOrderLineItem extends IEntity {
  billableLineItemId: number;
  quantity: number;
  globalRatesLineItemsId?: number | null;
  customRatesGroupLineItemsId?: number | null;
  applySurcharges: boolean;
  price?: number;
  nextPrice?: number;
  materialId?: number | null;
  billableLineItem?: VersionedEntity<ILineItem>;
  globalRatesLineItem?: VersionedEntity<IGlobalRateLineItem>;
  customRatesGroupLineItem?: VersionedEntity<ICustomRateLineItem>;
  material?: VersionedEntity<IMaterial>;
  effectiveDate?: Date | null;
  manifestNumber?: string;

  // for UI perspective
  units?: BillableLineItemUnitTypeEnum;
}

export interface IOrderRecurringLineItem extends IEntity {
  billableLineItemId: number;
  quantity: number;
  globalRatesRecurringLineItemsBillingCycleId?: number;
  customRatesGroupRecurringLineItemBillingCycleId?: number;
  price?: number;
  nextPrice?: number;
  billableLineItem?: VersionedEntity<ILineItem>;
  globalRatesLineItem?: VersionedEntity<IGlobalRateLineItem>;

  // for UI perspective
  units?: BillableItemActionEnum;
}

export interface IProcessedOrderLineItem
  extends Omit<IOrderLineItem, keyof IEntity>,
    Partial<IEntity> {
  billableLineItem?: VersionedEntity<ILineItem>;
  globalRatesLineItem?: VersionedEntity<IGlobalRateLineItem>;
  customRatesGroupLineItem?: VersionedEntity<ICustomRateLineItem>;
}

export interface IOrderIncludedLineItem extends IOrderLineItem {
  globalRatesLineItem: VersionedEntity<IGlobalRateLineItem>;
  billableLineItem: VersionedEntity<ILineItem>;
}
export interface IOrderCustomRatesGroupService extends Omit<IGlobalRateService, 'price'> {
  values?: number;
  customRatesGroupId: number;
}

export interface IOrderThreshold extends IEntity {
  thresholdId: number;
  globalRatesThresholdsId: number;
  customRatesGroupThresholdsId: number | null;
  price: number;
  quantity: number;
  applySurcharges: boolean;
  threshold: VersionedEntity<IThreshold>;
  globalRatesThreshold: VersionedEntity<IGlobalRateThreshold>;
  customRatesGroupThreshold?: VersionedEntity<IGlobalRateThreshold>; // TODO fix this
}

export interface IOrderSurcharge extends IEntity {
  billableLineItemId: number;
  billableServiceId: number;
  globalRatesSurchargesId?: number;
  customRatesGroupSurchargesId?: number;
  price?: number;
  materialId?: number | null;
  billableLineItem?: VersionedEntity<ILineItem>;
  billableService?: VersionedEntity<IBillableService>;
  globalRatesSurcharge?: VersionedEntity<IGlobalRateSurcharge>;
  customRatesGroupSurcharge?: VersionedEntity<ICustomRateSurcharge>;
  material?: VersionedEntity<IMaterial> | null;
  surcharge: VersionedEntity<ISurcharge>;
}

export interface IApproveOrFinalizeMultipleRequest {
  ids: number[] | null;
  businessUnitId: string;
  validOnly: boolean;
}

export interface IValidateMultipleOrdersRequest {
  ids: number[] | null;
}

export interface IInvoicingOrder extends Omit<IOrder, 'type' | 'jobSite' | 'customer'> {
  jobSite: VersionedEntity<IJobSite>;
}

export interface IOrderManifestItem extends IEntity {
  dispatchId: number | null;
  manifestNumber: string;
  material: VersionedEntity<IMaterial>;
  materialId: number;
  quantity: number;
  unitType: string;
  url: string;
  workOrderId: number;
  csrName?: string | null;
}

export interface IOrderNewManifestItem {
  workOrderId: number;
  materialId: number;
  manifestNumber: string;
  quantity: number;
  unitType: BillableLineItemUnitTypeEnum.YARD | BillableLineItemUnitTypeEnum.TON;
}

export interface IMapCompletedOrderThreshold {
  id: number;
  thresholdId: number;
  threshold: VersionedEntity<IThreshold>;
  price: number;
  quantity: number;
  applySurcharges: boolean;
}
export interface IMapCompletedOrderWorkOrder {
  id?: number;
  woNumber: number;
  route?: number | null;
  truckId?: number | null;
  driverId?: number | null;
  droppedEquipmentItem?: string | null;
  pickedUpEquipmentItem?: string | null;
  weight?: number | null;
  weightUnit: WorkOrderWeightUnit | null;
  mediaFiles: IWorkOrderMediaFile[];
  completionDate?: Date | null;
  ticket?: string | null;
  ticketUrl?: string | null;
  ticketAuthor?: string | null;
  ticketFromCsr?: boolean;
  ticketDate?: Date | null;
  startWorkOrderDate?: Date | null;
  arriveOnSiteDate?: Date | null;
  startServiceDate?: Date | null;
  finishWorkOrderDate?: Date | null;
}

export interface IMapLineItems {
  id?: number;
  billableLineItemId?: number;
  price?: number;
  quantity?: number;
  customRatesGroupLineItemsId?: number | null;
  globalRatesLineItemsId?: number | null;
  materialId?: number | null;
  manifestNumber?: string;
  applySurcharges: boolean;
}

export interface IMapCompletedOrder {
  noBillableService: boolean;
  action?: BillableItemActionEnum;
  disposalSiteId: number | null;
  driverInstructions: string | null;
  invoiceNotes: string | null;
  materialId: number | null;
  equipmentItemId: number | null;
  projectId: number | null;
  promoId: number | null;
  billableServicePrice?: number;
  billableServiceId: number | null;
  billableServiceApplySurcharges: boolean;
  thirdPartyHaulerId?: number | null;
  overrideCreditLimit?: boolean;
  isRollOff: boolean;
  workOrder?: IMapCompletedOrderWorkOrder;
  lineItems: IMapLineItems[];
  manifestItems: IOrderManifestItem[];
  thresholds: IMapCompletedOrderThreshold[];
  mediaFiles: File[];
  ticketFile?: FileWithPreview;
  paymentMethod: PaymentMethod;
  grandTotal: number;
  customerId: number;
  updatedAt: Date;
  applySurcharges: boolean;
  customRatesGroupId?: number | null;
  newManifestItems: IOrderNewManifestItem[];
  manifestFiles: File[];
}
