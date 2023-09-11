import { BillingCycleEnum, BillingTypeEnum, SubscriptionTabRoutes } from '@root/core/consts';
import { ManuallyCreatablePayment, PaymentMethod } from '@root/finance/types/entities';
import {
  IOrderCustomRatesGroupService,
  IOrderIncludedLineItem,
  IOrderThreshold,
  OrderCancellationReasonType,
  OrderTaxDistrict,
} from '@root/finance/types/entities/order';

import { FileWithPreview } from '../../../core/types/base';
import { IBusinessLine } from '../../../core/types/entities/businessLine';
import { IBusinessUnit } from '../../../core/types/entities/businessUnit';
import { IContact } from '../../../core/types/entities/contact';
import { ICreditCard } from '../../../core/types/entities/creditCard';
import { ICustomerJobSitePair } from '../../../core/types/entities/customerJobSitePair';
import { IEntity } from '../../../core/types/entities/entity';
import { EquipmentItemType } from '../../../core/types/entities/equipmentItem';
import { IFrequency, ServiceFrequencyAggregated } from '../../../core/types/entities/frequency';
import { IGlobalRateService } from '../../../core/types/entities/globalRate';
import { IJobSite } from '../../../core/types/entities/jobSite';
import { IMaterial } from '../../../core/types/entities/material';
import { IPermit } from '../../../core/types/entities/permit';
import { IPriceGroup } from '../../../core/types/entities/priceGroup';
import { IPromo } from '../../../core/types/entities/promo';
import { IServiceArea } from '../../../core/types/entities/serviceArea';
import { IServiceItem } from '../../../core/types/entities/serviceItem';
import { IThirdPartyHauler } from '../../../core/types/entities/thirdPartyHauler';
import { IUser } from '../../../core/types/entities/user';
import { IWorkOrder } from '../../../core/types/entities/workOrder';
import { VersionedEntity } from '../../../core/types/helpers/VersionedEntity';
import { IResponseBillableService } from '../../../core/types/responseEntities';
import { ICustomer } from '../../../customer/types/entities/customer';

export interface ISubscription extends IEntity {
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
  billingType: BillingTypeEnum;
  billingCycle: BillingCycleEnum;
  deferred: boolean;
  material: VersionedEntity<IMaterial> | null;
  paymentMethod: PaymentMethod;
  jobSiteContactTextOnly: boolean;
  startDate: Date;
  endDate: Date | null;
  serviceName: EquipmentItemType;
  serviceItems: IServiceItem[];
  status: SubscriptionStatusEnum;
  route: string;
  subscriptionContact: VersionedEntity<IContact>;
  lineItems: IOrderIncludedLineItem[];
  serviceFrequencyAggregated?: ServiceFrequencyAggregated;
  oneTimeOrdersIds: number[];
  nextBillingPeriodTo: Date;
  nextBillingPeriodFrom: Date;

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

export type CustomerSubscriptionsParams = {
  customerId: string;
  tab: SubscriptionTabRoutes;
};

export type SubscriptionOrderServiceItem = Omit<IServiceItem, 'lineItems' | 'subscriptionOrders'>;
