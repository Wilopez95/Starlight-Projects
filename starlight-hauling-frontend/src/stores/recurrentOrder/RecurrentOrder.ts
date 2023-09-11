import { convertDates, parseDate, substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import {
  RecurrentFormCustomFrequencyType,
  RecurrentFormFrequencyType,
} from '@root/pages/NewRequest/NewRequestForm/forms/RecurrentOrder/types';
import { convertPurchaseOrderDates } from '@root/stores/subscription/helpers';
import {
  IBillableService,
  IBusinessLine,
  IBusinessUnit,
  IContact,
  ICustomer,
  ICustomerJobSitePair,
  IDisposalSite,
  IEquipmentItem,
  IGlobalRateService,
  IJobSite,
  IMaterial,
  IMaterialProfile,
  IOrderCustomRatesGroupService,
  IOrderIncludedLineItem,
  IPermit,
  IPriceGroup,
  IProject,
  IPromo,
  IPurchaseOrder,
  IRecurrentOrder,
  IServiceArea,
  IThirdPartyHauler,
  IUser,
  JsonConversions,
  RecurrentOrderStatus,
  VersionedEntity,
} from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { RecurrentOrderStore } from './RecurrentOrderStore';

export class RecurrentOrder extends BaseEntity implements IRecurrentOrder {
  businessUnit: IBusinessUnit;
  businessLine: IBusinessLine;
  jobSite: VersionedEntity<IJobSite>;
  customer: VersionedEntity<ICustomer>;
  csr: VersionedEntity<IUser>;
  jobSiteContact: VersionedEntity<IContact>;
  beforeTaxesTotal: number;
  bestTimeToComeFrom: string;
  bestTimeToComeTo: string;
  billableLineItemsTotal: number;
  billableServicePrice: number;
  billableServiceQuantity: number;
  billableServiceApplySurcharges: boolean;
  billableServiceTotal: number;
  driverInstructions: string | null;
  earlyPick: boolean;
  surchargesTotal: number;
  applySurcharges: boolean;
  grandTotal: number;
  highPriority: boolean;
  initialGrandTotal: number;
  callOnWayPhoneNumber: string | null;
  callOnWayPhoneNumberId: number | null;
  textOnWayPhoneNumber: string | null;
  textOnWayPhoneNumberId: number | null;
  jobSiteNote: string | null;
  purchaseOrder: IPurchaseOrder | null;
  purchaseOrderId: number | null;
  someoneOnSite: boolean;
  toRoll: boolean;
  csrNotes: string | null;
  invoiceNotes: string | null;
  notifyDayBefore: 'byText' | 'byEmail' | null;
  material: VersionedEntity<IMaterial> | null;
  paymentMethod: 'onAccount';
  orderContact: VersionedEntity<IContact>;
  status: RecurrentOrderStatus;
  lineItems: IOrderIncludedLineItem[];
  startDate: Date;
  nextServiceDate: Date;
  frequencyType: RecurrentFormFrequencyType;
  unlockOverrides: boolean;
  frequencyPeriod?: number;
  customFrequencyType?: RecurrentFormCustomFrequencyType;
  frequencyDays?: number[];
  endDate: Date | null;
  lastFailureDate: Date | null;
  billableService: VersionedEntity<IBillableService>;
  equipmentItem?: VersionedEntity<IEquipmentItem>;
  serviceArea?: IServiceArea;
  customerJobSite?: VersionedEntity<ICustomerJobSitePair>;
  thirdPartyHauler?: VersionedEntity<IThirdPartyHauler>;
  globalRatesServices?: VersionedEntity<IGlobalRateService>;
  project?: VersionedEntity<IProject>;
  customRatesGroup?: VersionedEntity<IPriceGroup>;
  disposalSite?: VersionedEntity<IDisposalSite>;
  promo?: VersionedEntity<IPromo>;
  permit?: VersionedEntity<IPermit>;
  materialProfile?: VersionedEntity<IMaterialProfile>;
  customRatesGroupServices?: VersionedEntity<IOrderCustomRatesGroupService>;

  store: RecurrentOrderStore;

  constructor(store: RecurrentOrderStore, entity: JsonConversions<IRecurrentOrder>) {
    super(entity);

    this.id = entity.id;
    this.createdAt = parseDate(entity.createdAt);
    this.updatedAt = parseDate(entity.updatedAt);
    this.startDate = substituteLocalTimeZoneInsteadUTC(entity.startDate);
    this.nextServiceDate = substituteLocalTimeZoneInsteadUTC(entity.nextServiceDate);
    this.endDate = entity.endDate ? substituteLocalTimeZoneInsteadUTC(entity.endDate) : null;
    this.lastFailureDate = entity.lastFailureDate
      ? substituteLocalTimeZoneInsteadUTC(entity.lastFailureDate)
      : null;

    this.frequencyType = entity.frequencyType;
    this.frequencyPeriod = entity.frequencyPeriod;
    this.customFrequencyType = entity.customFrequencyType;
    this.frequencyDays = entity.frequencyDays;

    this.csrNotes = entity.csrNotes;
    this.invoiceNotes = entity.invoiceNotes;
    this.callOnWayPhoneNumber = entity.callOnWayPhoneNumber;
    this.callOnWayPhoneNumberId = entity.callOnWayPhoneNumberId;
    this.textOnWayPhoneNumber = entity.textOnWayPhoneNumber;
    this.textOnWayPhoneNumberId = entity.textOnWayPhoneNumberId;
    this.beforeTaxesTotal = entity.beforeTaxesTotal;
    this.grandTotal = entity.grandTotal;
    this.surchargesTotal = entity.surchargesTotal;
    this.applySurcharges = entity.applySurcharges;
    this.driverInstructions = entity.driverInstructions;
    this.someoneOnSite = entity.someoneOnSite;
    this.toRoll = entity.toRoll;
    this.highPriority = entity.highPriority;
    this.earlyPick = entity.earlyPick;
    this.jobSiteNote = entity.jobSiteNote;
    this.billableServiceTotal = entity.billableServiceTotal;
    this.billableLineItemsTotal = entity.billableLineItemsTotal;
    this.billableServicePrice = entity.billableServicePrice;
    this.billableServiceQuantity = entity.billableServiceQuantity;
    this.billableServiceApplySurcharges = entity.billableServiceApplySurcharges;
    this.initialGrandTotal = entity.initialGrandTotal;
    this.purchaseOrder = entity.purchaseOrder
      ? convertPurchaseOrderDates(entity.purchaseOrder)
      : null;
    this.purchaseOrderId = entity.purchaseOrderId;
    this.bestTimeToComeFrom = entity.bestTimeToComeFrom;
    this.bestTimeToComeTo = entity.bestTimeToComeTo;
    this.notifyDayBefore = entity.notifyDayBefore;
    this.paymentMethod = entity.paymentMethod;
    this.businessUnit = convertDates(entity.businessUnit);
    this.businessLine = convertDates(entity.businessLine);
    this.orderContact = convertDates(entity.orderContact);
    this.status = entity.status;
    this.unlockOverrides = entity.unlockOverrides;

    this.jobSite = convertDates(entity.jobSite);
    this.customer = convertDates(entity.customer);
    this.materialProfile = convertDates(entity.materialProfile);
    this.jobSiteContact = convertDates(entity.jobSiteContact);

    this.disposalSite = convertDates(entity.disposalSite);
    this.billableService = convertDates(entity.billableService);
    this.customRatesGroup = convertDates(entity.customRatesGroup);
    this.csr = convertDates(entity.csr);
    this.material = convertDates(entity.material);
    this.globalRatesServices = convertDates(entity.globalRatesServices);
    this.customRatesGroupServices = convertDates(entity.customRatesGroupServices);
    this.project = convertDates(entity.project);
    this.lineItems = entity.lineItems?.map(convertDates);
    this.customerJobSite = convertDates(entity.customerJobSite);
    this.thirdPartyHauler = convertDates(entity.thirdPartyHauler);
    this.permit = convertDates(entity.permit);
    this.promo = convertDates(entity.promo);
    this.serviceArea = convertDates(entity.serviceArea);
    this.equipmentItem = convertDates(entity.equipmentItem);

    this.store = store;
  }
}
