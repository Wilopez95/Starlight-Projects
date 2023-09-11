import { computed, observable } from 'mobx';

import { IUserQueryResult } from '@root/api/user/types';
import { convertDates } from '@root/helpers';
import {
  IAddress,
  IPhoneNumber,
  IPolicy,
  IRole,
  ISalesRepresentative,
  IUser,
  JsonConversions,
  PhoneNumberType,
  UserManagementMapper,
  UserManagementStatus,
} from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { UserStore } from './UserStore';

export class User extends BaseEntity implements IUser {
  active: boolean;
  email: string;
  name: string;
  hasPersonalPermissions: boolean;
  phones: Omit<IPhoneNumber, 'id'>[];
  policies?: IPolicy[];
  salesRepresentatives: ISalesRepresentative[];
  firstName?: string;
  lastName?: string;
  title?: string;
  address?: Omit<IAddress, 'id'>;

  // TODO: store actual `UserRole` entity inside `User`
  @observable roles?: IRole[];

  store: UserStore;

  constructor(store: UserStore, entity: UserManagementMapper<JsonConversions<IUserQueryResult>>) {
    super(entity);

    this.store = store;

    this.active = entity.status === UserManagementStatus.ACTIVE;
    this.email = entity.email;
    this.name = entity.name;
    this.hasPersonalPermissions = entity.hasPersonalPermissions;
    this.firstName = entity.firstName;
    this.lastName = entity.lastName;
    this.title = entity.title;
    this.roles = entity.roles?.map(convertDates);
    this.address = entity.address;
    this.phones = entity.phones?.map(phone => ({
      ...phone,
      type: phone.type.toLowerCase() as PhoneNumberType,
    }));
    this.policies =
      entity.allPermissions?.map(({ resource, entries }) => ({
        resource,
        access: Object.fromEntries(entries.map(({ subject, ...config }) => [subject, config])),
      })) ?? [];
    this.salesRepresentatives = entity.salesRepresentatives;
  }

  @computed
  get roleIds() {
    return this.roles?.map(role => role.id.toString());
  }

  get fullName() {
    if (this.firstName && this.lastName) {
      // TODO: take into account locales where order can be reversed
      return `${this.firstName} ${this.lastName}`;
    } else {
      return this.name;
    }
  }
}
