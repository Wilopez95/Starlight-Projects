import { computed } from 'mobx';

import { addressFormatShort, convertDates, parseDate } from '@root/core/helpers';
import { BaseEntity } from '@root/core/stores/base/BaseEntity';
import {
  EquipmentItemType,
  IBusinessLine,
  IBusinessUnit,
  IContact,
  ICreditCard,
  IFrequency,
  IJobSite,
  IPermit,
  IPriceGroup,
  IServiceArea,
  IServiceItem,
  ISubscriptionDraft,
  IThirdPartyHauler,
  IUser,
  JsonConversions,
  ServiceFrequencyAggregated,
  VersionedEntity,
} from '@root/core/types';
import { ICustomer } from '@root/customer/types';
import { IOrderIncludedLineItem, PaymentMethod } from '@root/finance/types/entities';

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
  route: string;
  jobSite: VersionedEntity<IJobSite>;
  paymentMethod: PaymentMethod;
  grandTotal: number;
  permitRequired: boolean;
  poRequired: boolean;
  signatureRequired: boolean;
  highPriority: boolean;
  lineItems: IOrderIncludedLineItem[];
  driverInstructions: string | null;
  bestTimeToComeFrom: string;
  bestTimeToComeTo: string;
  alleyPlacement: boolean;
  purchaseOrder: string | null;
  customRatesGroup?: VersionedEntity<IPriceGroup>;
  csr?: VersionedEntity<IUser>;
  serviceArea?: IServiceArea;
  thirdPartyHauler?: VersionedEntity<IThirdPartyHauler>;
  creditCard?: VersionedEntity<ICreditCard>;
  serviceFrequency?: IFrequency;
  serviceFrequencyAggregated?: ServiceFrequencyAggregated;
  permit?: VersionedEntity<IPermit>;
  someoneOnSite?: boolean;

  constructor(store: SubscriptionDraftStore, entity: JsonConversions<ISubscriptionDraft>) {
    super(entity);

    const draftEntity = convertDates(entity);

    this.store = store;
    this.jobSiteContactTextOnly = draftEntity.jobSiteContactTextOnly || false;
    this.startDate = parseDate(draftEntity.startDate);
    this.endDate = draftEntity.endDate ? parseDate(draftEntity.endDate) : null;
    this.serviceFrequencyAggregated = draftEntity.serviceFrequencyAggregated;
    this.serviceFrequency = draftEntity.serviceFrequency;
    this.serviceName = draftEntity.serviceName || [];
    this.serviceItems = entity.serviceItems?.map(convertServiceItemDates) || [];
    this.route = draftEntity.route || '';
    this.customer = convertDates(entity.customer);
    this.businessLine = convertDates(entity.businessLine);
    this.businessUnit = convertDates(entity.businessUnit);
    this.subscriptionContact = convertDates(entity.subscriptionContact);
    this.paymentMethod = draftEntity.paymentMethod;
    this.permitRequired = draftEntity.permitRequired;
    this.poRequired = draftEntity.poRequired;
    this.signatureRequired = draftEntity.signatureRequired;
    this.grandTotal = draftEntity.grandTotal;
    this.jobSite = convertDates(entity.jobSite);
    this.customRatesGroup = convertDates(entity.customRatesGroup);
    this.csr = convertDates(entity.csr);
    this.serviceArea = convertDates(entity.serviceArea);
    this.creditCard = convertDates(entity.creditCard);
    this.lineItems = entity.lineItems?.map(convertDates);
    this.driverInstructions = entity.driverInstructions || null;
    this.highPriority = entity.highPriority;
    this.bestTimeToComeFrom = entity.bestTimeToComeFrom;
    this.bestTimeToComeTo = entity.bestTimeToComeTo;
    this.alleyPlacement = entity.alleyPlacement;
    this.purchaseOrder = entity.purchaseOrder || null;
    this.permit = convertDates(entity.permit);
    this.thirdPartyHauler = convertDates(entity.thirdPartyHauler);
    this.someoneOnSite = entity.someoneOnSite;
  }
  serviceDaysOfWeek?: Record<string, string> | undefined;

  @computed get contactName() {
    if (!this.subscriptionContact) {
      return undefined;
    }

    const { firstName, lastName } = this.subscriptionContact;

    return `${firstName} ${lastName}`;
  }

  @computed get contactPhone() {
    return this.subscriptionContact?.phoneNumbers?.find(
      (phoneNumber) => phoneNumber.type === 'main',
    )?.number;
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
