import { PaymentMethod } from '@starlightpro/invoice-builder';

import type {
  IContact,
  ICreditCard,
  IEntity,
  IGlobalRateLineItem,
  IGlobalRateService,
  IGlobalRateThreshold,
  IJobSite,
  ILineItem,
  IServiceArea,
  ITaxDistrict,
  IThreshold,
} from '@root/core/types';
import { FileWithPreview } from '@root/core/types/base';
import { IBusinessLine } from '@root/core/types/entities/businessLine';
import { IBusinessUnit } from '@root/core/types/entities/businessUnit';
import { ICustomerJobSitePair } from '@root/core/types/entities/customerJobSitePair';
import { IDisposalSite } from '@root/core/types/entities/disposalSite';
import { IMaterial } from '@root/core/types/entities/material';
import { IMaterialProfile } from '@root/core/types/entities/materialProfile';
import { IPermit } from '@root/core/types/entities/permit';
import { IPriceGroup } from '@root/core/types/entities/priceGroup';
import { IProject } from '@root/core/types/entities/project';
import { IPromo } from '@root/core/types/entities/promo';
import { IThirdPartyHauler } from '@root/core/types/entities/thirdPartyHauler';
import { IUser } from '@root/core/types/entities/user';
import { IWorkOrder } from '@root/core/types/entities/workOrder';
import type { VersionedEntity } from '@root/core/types/helpers';
import type { IResponseBillableService } from '@root/core/types/responseEntities';
import { ICustomer } from '@root/customer/types/entities/customer';
import { IOrderLineItem } from '@root/orders-and-subscriptions/types/entities/order';

import { ManuallyCreatablePayment } from './payment';

export type OrderTaxDistrict = ITaxDistrict | Pick<ITaxDistrict, 'description'>;

export interface IOrder extends IEntity {
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
  earlyPick: boolean;
  grandTotal: number;
  highPriority: boolean;
  initialGrandTotal: number;
  callOnWayPhoneNumber: string | null;
  textOnWayPhoneNumber: string | null;
  jobSiteNote: string | null;
  purchaseOrder: string | null;
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
  status: OrderStatusType;
  lineItems: IOrderIncludedLineItem[];
  serviceArea?: IServiceArea;
  customerJobSite?: VersionedEntity<ICustomerJobSitePair>;
  thirdPartyHauler?: VersionedEntity<IThirdPartyHauler>;
  workOrder?: IWorkOrder;
  globalRatesServices?: VersionedEntity<IGlobalRateService>;
  billableService?: VersionedEntity<IResponseBillableService>;
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
  overrideCreditLimit?: boolean;
  payments?: ManuallyCreatablePayment[];
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

export type ApprovedOrFinalized = 'approved' | 'finalized';

export type OrderAllStatusTypes = OrderStatusType | 'total';

export type OrderCancellationReasonType =
  | 'customerCanceled'
  | 'duplicateOrder'
  | 'schedulingError'
  | 'internalError'
  | 'other';

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
  threshold: VersionedEntity<IThreshold>;
  globalRatesThreshold: VersionedEntity<IGlobalRateThreshold>;
  customRatesGroupThreshold: VersionedEntity<IGlobalRateThreshold>; // TODO fix this
}
