import { computed } from 'mobx';

import { BaseEntity } from '@root/core/stores/base/BaseEntity';
import { IContact, IPhoneNumber, JsonConversions } from '@root/core/types';

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
  main?: boolean;

  store: ContactStore;

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
