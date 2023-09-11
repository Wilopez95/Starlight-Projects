import { computed } from 'mobx';

import { getCreditCardBrand, parseDate } from '@root/core/helpers';
import { BaseEntity } from '@root/core/stores/base/BaseEntity';
import type { CreditCardType, ICreditCard, JsonConversions } from '@root/core/types';

import type { CreditCardStore } from './CreditCardStore';

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

    this.expDate = parseDate(entity.expDate);
    this.cardBrand = getCreditCardBrand(entity.cardType);
  }

  @computed get nickName() {
    return this.cardNickname || `${this.cardBrand} •••• ${this.cardNumberLastDigits}`;
  }
}
