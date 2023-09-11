import { camelCase } from 'lodash-es';
import { computed } from 'mobx';

import { getCreditCardBrand, substituteLocalTimeZoneInsteadUTC } from '../../../../helpers';
import { BaseEntity } from '../../../../stores/base/BaseEntity';
import { type JsonConversions, type PaymentGateway } from '../../../../types';
import { CreditCardType, ICreditCard } from '../types';

import { type CreditCardStore } from './CreditCardStore';

export class CreditCard extends BaseEntity implements ICreditCard {
  customerId: number;
  active: boolean;
  cardNickname: string | null;
  cardType: CreditCardType;
  cardNumberLastDigits: string;
  jobSites: number[] | null;
  nameOnCard: string;
  expDate: Date;
  expiredLabel: boolean;
  addressLine1: string;
  addressLine2: string | null;
  state: string;
  city: string;
  zip: string;
  expirationDate: string;
  cardBrand: string;
  isAutopay: boolean;
  spUsed: boolean;
  paymentGateway: PaymentGateway;

  store: CreditCardStore;

  constructor(store: CreditCardStore, entity: JsonConversions<ICreditCard>) {
    super(entity);

    this.store = store;
    this.expirationDate = entity.expirationDate;
    this.customerId = entity.customerId;
    this.active = entity.active;
    this.cardNickname = entity.cardNickname;
    this.cardType = entity.cardType;
    this.cardNumberLastDigits = entity.cardNumberLastDigits;
    this.jobSites = entity.jobSites;
    this.nameOnCard = entity.nameOnCard;
    this.expiredLabel = entity.expiredLabel;
    this.addressLine1 = entity.addressLine1;
    this.addressLine2 = entity.addressLine2;
    this.state = entity.state;
    this.city = entity.city;
    this.zip = entity.zip;
    this.isAutopay = entity.isAutopay;
    this.spUsed = entity.spUsed;
    this.paymentGateway = camelCase(entity.paymentGateway) as PaymentGateway;

    this.expDate = substituteLocalTimeZoneInsteadUTC(entity.expDate);
    this.cardBrand = getCreditCardBrand(entity.cardType);
  }

  @computed get validFor() {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (!this.jobSites || !this.jobSites.length) {
      return 'All Job Sites';
    } else {
      return this.store.globalStore.jobSiteStore.values
        .filter(jobSite => this.jobSites?.includes(jobSite.id))
        .map(jobSite => jobSite?.fullAddress)
        .join(' / ');
    }
  }

  @computed get nickName() {
    return this.cardNickname ?? `${this.cardBrand} •••• ${this.cardNumberLastDigits}`;
  }
}
