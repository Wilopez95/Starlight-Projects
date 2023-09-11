import { ISelectOption } from '@starlightpro/shared-components';

import { BestTimeToCome } from '@root/components/OrderTimePicker/types';
import {
  BillableItemActionEnum,
  BillableLineItemUnitTypeEnum,
  BillingCycleEnum,
  BillingTypeEnum,
  ClientRequestType,
  Routes,
  UpdateSubscriptionItemType,
} from '@root/consts';
import { type INewCreditCard, type PaymentMethod } from '@root/modules/billing/types';
import {
  EquipmentItemType,
  IBillableService,
  IBusinessContextIds,
  IChangeReason,
  IConfigurableReminderSchedule,
  IEntity,
  ILineItem,
  IMaterial,
  IPurchaseOrder,
  IServiceDaysOfWeek,
  ISubscriptionOnHoldDetails,
  ISubscriptionOrder,
  SubscriptionOrderStatusEnum,
  SubscriptionStatusEnum,
  ValueOf,
} from '@root/types';

import { INewClientRequest } from '../../types';
import { INewOrders } from '../Order/types';

export interface INewSubscriptionForm {
  commonValues: INewClientRequest;

  onOrdersChange(amount: number): void;

  subscriptionValues?: INewSubscription;
  isClone?: boolean;
}

export interface INewSubscriptionLineItem {
  billableLineItemId: number;
  quantity: number;
  unlockOverrides: boolean;
  price: number;
  id?: number;
  billableLineItem?: Omit<ILineItem, 'createdAt' | 'updatedAt'>;
  subscriptionServiceItemId?: number;
  globalRatesRecurringLineItemsBillingCycleId?: number;
  customRatesGroupRecurringLineItemBillingCycleId?: number;
  effectiveDate?: Date | null;
  isDeleted?: boolean;
  changeReason?: Omit<IChangeReason, 'businessLineNames'>;

  // for UI perspective
  units?: BillableLineItemUnitTypeEnum;
}

export interface ISubscriptionLineItemChangeEvent extends Partial<INewSubscriptionLineItem> {
  eventType: UpdateSubscriptionItemType;
  subscriptionServiceItemId: number;
  subscriptionDraftServiceItemId: number;
}

export interface ISubscriptionPayment {
  sendReceipt: boolean;
  authorizeCard: boolean;
  amount: number;
  paymentMethod: PaymentMethod;
  isAch: boolean;
  newCreditCard?: INewCreditCard;
  checkNumber?: string;
  creditCardId?: number;
}

export interface ISubscriptionCustomerJobSitePairSection {
  poRequired: boolean;
  permitRequired: boolean;
  signatureRequired: boolean;
  popupNote: string;
  alleyPlacement: boolean;
}

export interface INewSubscriptionOrder {
  id: number;
  billableServiceId: number;
  quantity: number;
  unlockOverrides: boolean;
  price: number;
  subscriptionOrderOptions: SubscriptionOrderOption[];
  globalRatesServicesId?: number | null;
  customRatesGroupServicesId?: number;
  serviceDate?: Date;
  action?: string;
  isFinalForService?: boolean;
  status?: SubscriptionOrderStatusEnum;
  billableService?: IBillableService;
  oneTime?: boolean;
}

export interface ISubscriptionOrderChangeEvent extends Partial<INewSubscriptionOrder> {
  eventType: UpdateSubscriptionItemType;
  subscriptionServiceItemId: number;
  subscriptionDraftServiceItemId: number;
}

export interface ISubscriptionSummarySection {
  grandTotal: number;
  unlockOverrides: boolean;
  recurringGrandTotal: number;
  periodFrom?: Date;
  periodTo?: Date;
  promoId?: number | null;
}

export interface ISubscriptionPaymentSection {
  payments: ISubscriptionPayment[];
}

export interface IServiceDayOfWeek extends ValueOf<IServiceDaysOfWeek> {
  day: string;
}

export type SubscriptionOrderOption = ISelectOption & {
  action: BillableItemActionEnum;
  isIncludedInService?: boolean;
};

export interface INewServiceItemSubscriptionOrders {
  optionalSubscriptionOrders: INewSubscriptionOrder[];
  subscriptionOrders: INewSubscriptionOrder[];
}

export interface INewSubscriptionService
  extends Partial<IEntity>,
    INewServiceItemSubscriptionOrders {
  id: number;
  serviceFrequencyOptions: ISelectOption[];
  lineItems: INewSubscriptionLineItem[];
  equipmentItemsMaterialsOptions: ISelectOption[];
  quantity: number;
  effectiveDate: Date | null;
  serviceFrequencyId: number | null;
  serviceDaysOfWeek: IServiceDayOfWeek[];
  unlockOverrides: boolean;
  price: number;
  billableServiceId?: number;
  billableServiceAction?: BillableItemActionEnum;
  customRatesGroupServicesId?: number;
  globalRatesRecurringServicesId?: number;
  materialId?: number;
  subscriptionId?: number;
  shortDescription?: string;
  billableServiceInclusion?: string;
  billableServiceInclusionIds?: number[];
  billingCycle?: BillingCycleEnum;
  showEffectiveDate?: boolean;
  isDeleted?: boolean;
  preSelectedService?: ISelectOption;
  billableService?: IBillableService;
  changeReason?: Omit<IChangeReason, 'businessLineNames'>;
}

export interface ISubscriptionServiceChangeEvent extends Partial<INewSubscriptionService> {
  eventType: UpdateSubscriptionItemType;
}

export interface INewSubscriptionFormData {
  id: number;
  highPriority: boolean;
  someoneOnSite: boolean;
  orderContactId: number;
  bestTimeToCome: BestTimeToCome;
  bestTimeToComeFrom: Date | string | null;
  bestTimeToComeTo: Date | string | null;
  serviceItems: INewSubscriptionService[];
  minBillingPeriods: number | null;
  customRatesGroupOptions: ISelectOption[];
  priceGroupOptions: ISelectOption[];
  anniversaryBilling: boolean;
  driverInstructions?: string;
  permitId?: number;
  purchaseOrder?: IPurchaseOrder;
  purchaseOrderId?: number;
  thirdPartyHaulerId?: number | null;
  customRatesGroupId?: number;
  droppedEquipmentItem?: string;
  startDate?: Date;
  endDate?: Date;
  equipmentType?: EquipmentItemType;
  subscriptionOrders?: ISubscriptionOrder[];
  billingType?: BillingTypeEnum;
  billingCycle?: BillingCycleEnum;
  annualReminderConfig?: IConfigurableReminderSchedule;
  csrComment?: string;

  // For UI Perspectives
  promoApplied: boolean;
  competitorId?: number;
  competitorExpirationDate?: Date;
  servicesQuantity?: Record<string, number>;
}

export interface INewSubscription
  extends IBusinessContextIds,
    ISubscriptionCustomerJobSitePairSection,
    ISubscriptionSummarySection,
    INewSubscriptionFormData,
    Partial<ISubscriptionOnHoldDetails> {
  type: ClientRequestType;
  searchString: string;
  customerId: number;
  jobSiteId: number;
  jobSiteContactId: number;
  overrideCreditLimit: boolean;
  clonedFromSubscriptionId?: number;
  customerJobSiteId?: number | null;
  serviceAreaId?: number;
  status?: SubscriptionStatusEnum;
  onHold?: boolean;
  offHold?: boolean;
  invoicedDate?: Date | null;
  changeReasonId?: number;
  showProrationButton?: boolean;
  showedProration?: boolean;
  workOrderNote?: string;
  thirdPartyHaulerId?: number | null;
}

export interface INewSubscriptionOrders extends Omit<INewOrders, 'lineItems'> {
  subscriptionId: number;
  type: ClientRequestType.SubscriptionOrder | ClientRequestType.SubscriptionNonService;
  status: SubscriptionOrderStatusEnum;
  overrideCreditLimit: boolean;
  lineItems?: ISubscriptionOrderLineItem[];
  subscriptionOrderOptions: SubscriptionOrderOption[];
}

export interface IShowUpdateMessages {
  isShowAddDeliveryOrderMessage: boolean;
  isShowAddFinalOrderMessage: boolean;
  showEffectiveDate: boolean;
  isUpdatedServiceItem?: boolean;
}

export interface IGetShowUpdateMessagesParams {
  service: INewSubscriptionService;
  isSubscriptionEdit: boolean;
  initialService?: INewSubscriptionService;
}

export interface ISubscriptionServiceItems {
  billingCycle: string;
  effectiveDate: string;
  recalculate: boolean;
  prorateTotal: number;
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
  lineItems: INewSubscriptionLineItem[];
  serviceDaysOfWeek: IServiceDayOfWeek[];
  serviceFrequencyId?: number;
}

export interface IRecurringSubscriptionLineItem {
  billableLineItemId: number;
  quantity: number;
  billableLineItem: Omit<ILineItem, keyof IEntity>;
  effectiveDate: Date | null;
  isDeleted: boolean;
  id?: number;
  subscriptionServiceItemId?: number;
  globalRatesRecurringLineItemsBillingCycleId?: number;
  customRatesGroupRecurringLineItemBillingCycleId?: number;
  price?: number;
}

export interface ISubscriptionWorkOrderServiceItem extends IEntity {
  // TODO: move to appropriate place
  id: number;
  billingCycle: string;
  effectiveDate: Date;
  recalculate: boolean;
  prorateTotal: number;
  serviceFrequencyId: number;
  subscriptionId: number;
  billableServiceId: number;
  globalRatesRecurringServicesId: number | null;
  customRatesGroupServicesId: number | null;
  materialId: number;
  quantity: number;
  price: number;
  endDate: string;
  isDeleted: boolean;
  serviceDaysOfWeek: IServiceDayOfWeek;
  recurrentLineItems: IRecurringSubscriptionLineItem[];
  billableLineItem: ILineItem;
}

export interface IServiceLineItem extends INewSubscriptionLineItem {
  billableLineItem: Omit<ILineItem, 'createdAt' | 'updatedAt'>;
}

export interface ISubscriptionOrderLineItem {
  id: number;
  billableLineItemId: number;
  quantity: number;
  unlockOverrides: boolean;
  customRatesGroupLineItemsId?: number | null;
  globalRatesLineItemsId?: number | null;
  units?: BillableLineItemUnitTypeEnum;
  price?: number;
  subscriptionOrderId?: number;
  materialId?: number | null;
  historicalLineItem?: {
    originalId: number;
    description: string;
    oneTime: boolean;
    unit?: BillableLineItemUnitTypeEnum;
  };
}

export interface INewSubscriptionFormParams {
  subscriptionId: string;
  entity: Routes.Subscription | Routes.SubscriptionDraft;
}

export interface IGenerateSubscriptionUpdateEventsParams {
  values: INewSubscription;
  initialValues?: INewSubscription;
}

export interface IBillingPeriod {
  billingCycle: BillingCycleEnum;
  startDate: Date;
  endDate: Date;
  anniversaryBilling: boolean;
}

export interface IBillingSinglePeriod {
  billingPeriodStartDay?: Date;
  billingPeriodLastDay?: Date;
}

export interface IReturnedValueOfBillingPeriod {
  billingPeriodsArr: IBillingSinglePeriod[] | Date[];
  numberOfBillingPeriod?: number;
}
