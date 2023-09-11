import { IOrderSelectCustomRatesResponse, IOrderSelectGlobalRatesResponse } from '@root/api';
import { BestTimeToCome } from '@root/components/OrderTimePicker/types';
import { ClientRequestType } from '@root/consts';
import {
  IBusinessContextIds,
  ICustomRateSurcharge,
  IGlobalRateSurcharge,
  IPurchaseOrder,
  ITaxDistrict,
} from '@root/types';

import { INewClientRequest } from '../../types';
import {
  INewOrderFormData,
  INewOrderService,
  IOrderCustomerJobSitePairSection,
  IOrderLineItem,
  IOrderPayment,
  IOrderSummarySection,
} from '../Order/types';

export interface INewRecurrentOrderForm {
  commonValues: INewClientRequest;
  onOrdersChange(amount: number): void;
}

export type RecurrentFormBasePath = 'final' | 'delivery' | 'recurrentTemplateData';
export enum RecurrentFormFrequencyType {
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly',
  custom = 'custom',
}

export enum RecurrentFormCustomFrequencyType {
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly',
}

export interface INewRecurrentOrderFormData extends INewOrderService {
  someoneOnSite: boolean;
  toRoll: boolean;
  highPriority: boolean;
  earlyPick: boolean;
  orderContactId: number;
  bestTimeToCome: BestTimeToCome;
  bestTimeToComeFrom: string | Date | null;
  bestTimeToComeTo: string | Date | null;
  notifyDayBefore: 'byText' | 'byEmail' | null;
  lineItems: IOrderLineItem[];
  startDate: Date;
  applySurcharges: boolean;
  isOneTimePO: boolean;
  endDate?: Date | null;
  frequencyType?: RecurrentFormFrequencyType;
  frequencyPeriod?: number;
  customFrequencyType?: RecurrentFormCustomFrequencyType;
  frequencyDays?: number[];
  equipmentItemId?: number;
  driverInstructions?: string;
  permitId?: number;
  purchaseOrder?: IPurchaseOrder;
  purchaseOrderId?: number;
  oneTimePurchaseOrderNumber?: string | null;
  disposalSiteId?: number;
  thirdPartyHaulerId?: number;
  customRatesGroupId?: number;
  materialProfileId?: number | null;
  callOnWayPhoneNumber?: string;
  callOnWayPhoneNumberId?: number;
  textOnWayPhoneNumber?: string;
  textOnWayPhoneNumberId?: number;
  globalRatesSurcharges?: IGlobalRateSurcharge[];
  customRatesSurcharges?: ICustomRateSurcharge[];

  // For UI Perspectives
  noBillableService: boolean;
  promoApplied: boolean;
  notificationApplied: boolean;
  selectedGroup: IOrderSelectCustomRatesResponse | IOrderSelectGlobalRatesResponse | null;
}

export interface IEditRecurrentOrderFormData
  extends Omit<
    INewRecurrentOrderFormData,
    | 'lineItems'
    | 'frequencyPeriod'
    | 'customFrequencyType'
    | 'callOnWayPhoneNumber'
    | 'textOnWayPhoneNumber'
  > {
  commercialTaxesUsed: boolean;
  lineItems?: IOrderLineItem[];
  frequencyPeriod?: number | null;
  callOnWayPhoneNumber?: string | null;
  textOnWayPhoneNumber?: string | null;
  customFrequencyType?: RecurrentFormCustomFrequencyType | null;
}

export interface INewRecurrentOrder extends IBusinessContextIds {
  type: ClientRequestType;
  recurrentTemplateData: INewRecurrentOrderFormData & IOrderSummarySection;
  searchString: string;
  customerId: number;
  jobSiteId: number;
  jobSiteContactId: number;
  pair: IOrderCustomerJobSitePairSection;
  commercialTaxesUsed: boolean;
  overrideCreditLimit: boolean;
  payment: Omit<IOrderPayment, 'overrideCreditLimit'>;
  customerJobSiteId?: number | null;
  applySurcharges: boolean;
  delivery?: INewOrderFormData & Omit<IOrderSummarySection, 'unlockOverrides'>;
  final?: INewOrderFormData & Omit<IOrderSummarySection, 'unlockOverrides'>;
  projectId?: number | null;
  serviceAreaId?: number;
  taxDistricts?: ITaxDistrict[];
  id?: number;

  // For UI Perspectives
  isDeliveryApplied: boolean;
  isFinalApplied: boolean;
  workOrderNote?: string;
}
