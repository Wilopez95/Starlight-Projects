import { computed, observable } from 'mobx';

import { IContact, IPhoneNumber, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { ContactStore } from './ContactStore';

export class Contact extends BaseEntity implements IContact {
  active: boolean;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  email: string | null;
  allowContractorApp: boolean;
  allowCustomerPortal: boolean;
  customerPortalUser: boolean;
  phoneNumbers?: IPhoneNumber[];
  customerId?: number;

  store: ContactStore;

  @observable main?: boolean;

  constructor(store: ContactStore, entity: JsonConversions<IContact>) {
    super(entity);

    this.store = store;
    this.email = entity.email;
    this.active = entity.active;
    this.customerId = entity.customerId;
    this.firstName = entity.firstName;
    this.lastName = entity.lastName;
    this.jobTitle = entity.jobTitle;
    this.phoneNumbers = entity.phoneNumbers;
    this.main = entity.main;
    this.allowContractorApp = entity.allowContractorApp;
    this.allowCustomerPortal = entity.allowCustomerPortal;
    this.customerPortalUser = entity.customerPortalUser;
  }

  @computed
  get name() {
    return `${this.firstName} ${this.lastName}`;
  }
}
