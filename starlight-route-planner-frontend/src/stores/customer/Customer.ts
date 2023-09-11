import { ICustomer, IPhoneNumber, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { CustomerStore } from './CustomerStore';

export class Customer extends BaseEntity implements ICustomer {
  name: string;
  firstName: string;
  lastName: string;
  phoneNumbers: IPhoneNumber[];
  mainFirstName: string;
  mainLastName: string;

  store: CustomerStore;

  constructor(store: CustomerStore, entity: JsonConversions<ICustomer>) {
    super(entity);

    this.store = store;

    this.name = entity.name;
    this.firstName = entity.firstName;
    this.lastName = entity.lastName;
    this.phoneNumbers = entity.phoneNumbers;
    this.mainFirstName = entity.mainFirstName;
    this.mainLastName = entity.mainLastName;
  }
}
