import { UpdateSubscriptionItemType } from '@root/core/consts';
import {
  IBillableService,
  IBusinessContextIds,
  ILineItem,
  IMaterial,
  INewCreditCard,
  ISubscriptionOrder,
  SubscriptionStatusEnum,
  ThresholdUnitType,
} from '@root/core/types';
import { PaymentMethod } from '@root/finance/types/entities';

export interface ISubscriptionLineItem {
  id?: number;
  billableLineItemId: number;
  quantity: number;
  initialQuantity?: number;
  units: 'each' | ThresholdUnitType;
  globalRatesRecurringLineItemsBillingCycleId?: number;
  customRatesGroupRecurringLineItemBillingCycleId?: number;
  price?: number;
  nextPrice?: number;
  eventType?: UpdateSubscriptionItemType;
  effectiveDate?: Date | null;
  isDeleted?: boolean;
}

export interface ISubscriptionPayment {
  sendReceipt: boolean;
  authorizeCard: boolean;
  amount: number;
  paymentMethod: PaymentMethod;
  newCreditCard?: INewCreditCard;
  checkNumber?: string;
  creditCardId?: number;
  isAch: boolean;
}

export interface ISubscriptionCustomerJobSitePairSection {
  poRequired: boolean;
  permitRequired: boolean;
  signatureRequired: boolean;
  popupNote: string;
  alleyPlacement: boolean;
}

export interface ISubscriptionSummarySection {
  grandTotal: number;
  unlockOverrides: boolean;
  promoId?: number | null;
}
export interface ISubscriptionPaymentSection {
  payments: ISubscriptionPayment[];
}

export type ServiceDayOfWeek = {
  day: string;
  route: string;
};

export type RemovedLineItem = {
  id: number;
  eventType: UpdateSubscriptionItemType;
};

export type RemovedService = {
  id: number;
  eventType: UpdateSubscriptionItemType;
};

export interface INewSubscription
  extends IBusinessContextIds,
    ISubscriptionCustomerJobSitePairSection,
    ISubscriptionSummarySection,
    ISubscriptionPaymentSection {
  // INewSubscriptionFormData
  type: any;
  searchString: string;
  customerId: number;
  jobSiteId: number;
  jobSiteContactId: number;
  serviceDaysOfWeek: ServiceDayOfWeek[];
  oneTimeOrdersIds: number[];
  serviceAreaId?: number;
  status?: SubscriptionStatusEnum;
  removedLineItems?: RemovedLineItem[];
  removedServices?: RemovedService[];
}

export interface ISubscriptionServiceItems {
  billingCycle: string;
  effectiveDate: string;
  recalculate: boolean;
  prorateTotal: number;
  serviceFrequencyId: number;
  subscriptionId: number;
  billableServiceId: number;
  globalRatesRecurringServicesId: number;
  customRatesGroupServicesId: number;
  materialId: number;
  quantity: number;
  price: number;
  billableService: Omit<IBillableService, 'createdAt' | 'updatedAt' | 'services'>;
  material: Omit<IMaterial, 'createdAt' | 'updatedAt'>;
  subscriptionOrders: Partial<ISubscriptionOrder>[];
  lineItems: IServiceLineItem[];
}

export interface IServiceLineItem extends ISubscriptionLineItem {
  billableLineItem: Omit<ILineItem, 'createdAt' | 'updatedAt'>;
}
