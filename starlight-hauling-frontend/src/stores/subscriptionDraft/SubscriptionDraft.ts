import { computed } from 'mobx';

import { BillingCycleEnum, BillingTypeEnum } from '@root/consts';
import { addressFormatShort, convertDates, substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import { type ICreditCard } from '@root/modules/billing/types';
import {
  EquipmentItemType,
  IBusinessLine,
  IBusinessUnit,
  IContact,
  ICustomer,
  IJobSite,
  IOrderIncludedLineItem,
  IPermit,
  IPriceGroup,
  IPromo,
  IPurchaseOrder,
  IServiceArea,
  IServiceItem,
  ISubscriptionDraft,
  ISubscriptionProration,
  IThirdPartyHauler,
  IUser,
  JsonConversions,
  VersionedEntity,
} from '@root/types';
import { ServiceFrequencyAggregated } from '@root/types/entities/frequency';

import { BaseEntity } from '../base/BaseEntity';
import { convertServiceItemDates, getSubscriptionColorByStatus } from '../subscription/helpers';

import { SubscriptionDraftStore } from './SubscriptionDraftStore';

export class SubscriptionDraft extends BaseEntity implements ISubscriptionDraft {
  businessUnit: IBusinessUnit;
  businessLine: IBusinessLine;
  customer: VersionedEntity<ICustomer>;
  jobSiteContactTextOnly: boolean;
  startDate: Date;
  endDate: Date | null;
  serviceName: EquipmentItemType;
  serviceItems: IServiceItem[] = [];
  subscriptionContact?: VersionedEntity<IContact>;
  store: SubscriptionDraftStore;
  jobSite: VersionedEntity<IJobSite>;
  jobSiteContact: VersionedEntity<IContact>;
  grandTotal: number;
  billingType: BillingTypeEnum;
  billingCycle: BillingCycleEnum;
  anniversaryBilling: boolean;
  nextBillingPeriodTo: Date;
  nextBillingPeriodFrom: Date;
  permitRequired: boolean;
  poRequired: boolean;
  signatureRequired: boolean;
  highPriority: boolean;
  lineItems: IOrderIncludedLineItem[];
  driverInstructions: string | null;
  bestTimeToComeFrom: string;
  bestTimeToComeTo: string;
  alleyPlacement: boolean;
  purchaseOrder: IPurchaseOrder | null;
  competitor: IThirdPartyHauler | null;
  competitorExpirationDate: Date | null;
  unlockOverrides: boolean;
  minBillingPeriods: number | null;
  csrEmail: string;
  csrComment?: string;
  customRatesGroupId?: number;
  someoneOnSite?: boolean;
  customRatesGroup?: VersionedEntity<IPriceGroup>;
  csr?: VersionedEntity<IUser>;
  serviceArea?: IServiceArea;
  thirdPartyHauler?: VersionedEntity<IThirdPartyHauler>;
  creditCard?: VersionedEntity<ICreditCard>;
  serviceFrequencyAggregated?: ServiceFrequencyAggregated;
  permit?: VersionedEntity<IPermit>;
  promo?: VersionedEntity<IPromo>;
  proration?: ISubscriptionProration;

  constructor(store: SubscriptionDraftStore, entity: JsonConversions<ISubscriptionDraft>) {
    super(entity);

    const draftEntity = convertDates(entity);

    this.store = store;
    this.jobSiteContactTextOnly = draftEntity.jobSiteContactTextOnly || false;
    this.startDate = substituteLocalTimeZoneInsteadUTC(draftEntity.startDate);
    this.endDate = draftEntity.endDate
      ? substituteLocalTimeZoneInsteadUTC(draftEntity.endDate)
      : null;
    this.serviceFrequencyAggregated = draftEntity.serviceFrequencyAggregated;
    this.serviceName = draftEntity.serviceName || [];
    this.serviceItems = entity.serviceItems?.map(convertServiceItemDates) || [];
    this.customer = convertDates(entity.customer);
    this.businessLine = convertDates(entity.businessLine);
    this.businessUnit = convertDates(entity.businessUnit);
    this.subscriptionContact = convertDates(entity.subscriptionContact);
    this.permitRequired = draftEntity.permitRequired;
    this.poRequired = draftEntity.poRequired;
    this.signatureRequired = draftEntity.signatureRequired;
    this.grandTotal = draftEntity.grandTotal;
    this.jobSite = convertDates(entity.jobSite);
    this.jobSiteContact = draftEntity.jobSiteContact;
    this.someoneOnSite = draftEntity.someoneOnSite;
    this.customRatesGroup = convertDates(entity.customRatesGroup);
    this.csr = convertDates(entity.csr);
    this.csrEmail = entity.csrEmail;
    this.serviceArea = convertDates(entity.serviceArea);
    this.creditCard = convertDates(entity.creditCard);
    this.lineItems = entity.lineItems?.map(convertDates);
    this.driverInstructions = entity.driverInstructions ?? null;
    this.highPriority = entity.highPriority;
    this.bestTimeToComeFrom = entity.bestTimeToComeFrom;
    this.bestTimeToComeTo = entity.bestTimeToComeTo;
    this.alleyPlacement = entity.alleyPlacement;
    this.purchaseOrder = convertDates(entity.purchaseOrder);
    this.permit = convertDates(entity.permit);
    this.thirdPartyHauler = convertDates(entity.thirdPartyHauler);
    this.someoneOnSite = entity.someoneOnSite;
    this.billingCycle = entity.billingCycle;
    this.billingType = entity.billingType;
    this.anniversaryBilling = entity.anniversaryBilling;
    this.nextBillingPeriodTo = substituteLocalTimeZoneInsteadUTC(entity.nextBillingPeriodTo);
    this.nextBillingPeriodFrom = substituteLocalTimeZoneInsteadUTC(entity.nextBillingPeriodFrom);
    this.minBillingPeriods = entity.minBillingPeriods;
    this.promo = draftEntity.promo;
    this.competitor = draftEntity.competitor;
    this.csrComment = draftEntity.csrComment;
    this.competitorExpirationDate = entity.competitorExpirationDate
      ? substituteLocalTimeZoneInsteadUTC(entity.competitorExpirationDate)
      : null;
    this.unlockOverrides = draftEntity.unlockOverrides;
  }

  @computed get contactName() {
    if (!this.subscriptionContact) {
      return undefined;
    }

    const { firstName, lastName } = this.subscriptionContact;

    return `${firstName} ${lastName}`;
  }

  @computed get contactPhone() {
    return this.subscriptionContact?.phoneNumbers?.find(phoneNumber => phoneNumber.type === 'main')
      ?.number;
  }

  @computed get colorByStatus() {
    return getSubscriptionColorByStatus();
  }

  @computed get jobSiteShortAddress() {
    //TODO fix this
    if (!this.jobSite) {
      return '';
    }

    return addressFormatShort(this.jobSite.address);
  }

  @computed get priceGroup() {
    return this.customRatesGroup?.description ?? 'General Price Group';
  }

  @computed get csrName() {
    if (!this.csr) {
      return 'Root';
    }

    return this.csr.firstName && this.csr.lastName
      ? `${this.csr.firstName} ${this.csr.lastName}`
      : this.csr.name;
  }
}
