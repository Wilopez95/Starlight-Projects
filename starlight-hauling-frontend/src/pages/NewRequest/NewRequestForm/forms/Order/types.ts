import { ObjectSchemaDefinition } from 'yup';

import { IOrderSelectCustomRatesResponse, IOrderSelectGlobalRatesResponse } from '@root/api';
import { BestTimeToCome } from '@root/components/OrderTimePicker/types';
import { BillableLineItemUnitTypeEnum, ClientRequestType } from '@root/consts';
import { I18nStore } from '@root/i18n/I18nStore';
import { type INewCreditCard, type PaymentMethod } from '@root/modules/billing/types';
import { BillableServiceStore } from '@root/stores/billableService/BillableServiceStore';
import { BusinessLineStore } from '@root/stores/businessLine/BusinessLineStore';
import { MaterialStore } from '@root/stores/material/MaterialStore';
import { SurchargeStore } from '@root/stores/surcharge/SurchargeStore';
import {
  FileWithPreview,
  IBusinessContextIds,
  IConfigurableReminderSchedule,
  IContact,
  ICustomerJobSitePair,
  ICustomRateSurcharge,
  IGlobalRateSurcharge,
  IMaterial,
  IPurchaseOrder,
  ISurcharge,
  ITaxDistrict,
} from '@root/types';

import { INewClientRequest } from '../../types';

export interface INewOrdersForm {
  commonValues: INewClientRequest;
  onOrdersChange(amount: number): void;
}
export interface IOrderLineItem {
  billableLineItemId: number;
  quantity: number;
  applySurcharges: boolean;
  globalRatesLineItemsId?: number | null;
  customRatesGroupLineItemsId?: number | null;
  materialId?: number | null;
  price?: number;

  // for UI perspective
  units?: BillableLineItemUnitTypeEnum;
}

export interface IOrderPayment {
  sendReceipt: boolean;
  authorizeCard: boolean;
  isAch: boolean;
  amount: number | string;
  paymentMethod?: PaymentMethod;
  newCreditCard?: INewCreditCard;
  checkNumber?: string;
  creditCardId?: number;
  deferredUntil?: Date;
  deferredPayment?: boolean;
  overrideCreditLimit?: boolean;
}

export interface IOrderCustomerJobSitePairSection {
  poRequired: boolean;
  permitRequired: boolean;
  signatureRequired: boolean;
  popupNote: string;
  workOrderNote?: string;
  cabOver: boolean;
  alleyPlacement: boolean;
}

export interface IOrderSummarySection {
  grandTotal: number;
  unlockOverrides: boolean;
  promoId?: number | null;
}
export interface IOrderPaymentSection {
  payments: IOrderPayment[];
}

export interface INewOrderService {
  equipmentItemsMaterialsOptions: IMaterial[];
  billableServiceId?: number;
  customRatesGroupServicesId?: number;
  globalRatesServicesId?: number;
  materialId?: number;
  billableServicePrice?: number;
  billableServiceQuantity: number;
  billableServiceApplySurcharges?: boolean;
}

export interface INewOrderFormData extends INewOrderService {
  someoneOnSite: boolean;
  toRoll: boolean;
  highPriority: boolean;
  earlyPick: boolean;
  orderContactId: number;
  bestTimeToCome: BestTimeToCome;
  bestTimeToComeFrom: string | Date | null;
  bestTimeToComeTo: string | Date | null;
  notifyDayBefore: 'byText' | 'byEmail' | null;
  serviceDate: Date;
  lineItems: IOrderLineItem[];
  isOneTimePO: boolean;
  jobSite2Id?: number;
  equipmentItemId?: number;
  driverInstructions?: string;
  permitId?: number;
  purchaseOrder?: IPurchaseOrder | null;
  purchaseOrderId?: number;
  oneTimePurchaseOrderNumber?: string;
  disposalSiteId?: number;
  thirdPartyHaulerId?: number;
  customRatesGroupId?: number;
  droppedEquipmentItem?: string;
  materialProfileId?: number | null;
  callOnWayPhoneNumberId?: number;
  callOnWayPhoneNumber?: string;
  textOnWayPhoneNumber?: string;
  textOnWayPhoneNumberId?: number;

  // For UI Perspectives
  noBillableService: boolean;
  promoApplied: boolean;
  applySurcharges: boolean;
  notificationApplied: boolean;
  droppedEquipmentItemApplied: boolean;
  droppedEquipmentItemComment: string;
  assignEquipmentItem: boolean;
  selectedGroup: IOrderSelectCustomRatesResponse | IOrderSelectGlobalRatesResponse | null;
  jobSite2IdSearchString: string;
  jobSite2Label?: string;
  workOrderNote?: string;

  globalRatesSurcharges?: IGlobalRateSurcharge[];
  customRatesSurcharges?: ICustomRateSurcharge[];
  droppedEquipmentItemCode?: string;
  pickedUpEquipmentItemCode?: string;
  route?: string | null;
}

export interface INewOrders
  extends IBusinessContextIds,
    IOrderCustomerJobSitePairSection,
    IOrderSummarySection,
    IOrderPaymentSection {
  type: ClientRequestType;
  orders: INewOrderFormData[];
  searchString: string;
  customerId: number;
  jobSiteId: number;
  jobSiteContactId: number;
  commercialTaxesUsed: boolean;
  mediaUrls?: (string | FileWithPreview)[];
  customerJobSite?: ICustomerJobSitePair;
  customerJobSiteId?: number | null;
  projectId?: number;
  serviceAreaId?: number;
  taxDistricts?: ITaxDistrict[];
  contractorContact?: IContact;
  applySurcharges: boolean;
  equipmentItemId?: number;
  orderRequestId?: number;
  surcharges?: ISurcharge[];
  annualReminderConfig?: IConfigurableReminderSchedule;
  contractorId?: number;
  final?: INewOrderFormData;
  recurrentTemplateData?: INewOrderFormData;
  delivery?: INewOrderFormData;
}

export interface IValidationData {
  materialStore: MaterialStore;
  surchargeStore: SurchargeStore;
  billableServiceStore: BillableServiceStore;
  i18nStore: I18nStore;
  businessLineStore?: BusinessLineStore;
  additionalOrderFields?: ObjectSchemaDefinition<Record<string, unknown>>;
  additionalServiceFields?: ObjectSchemaDefinition<Record<string, unknown>>;
}
