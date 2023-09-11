import { IRoleQueryResult } from '@root/api/role/types';
import {
  IPolicy,
  IPolicyTemplate,
  IRole,
  JsonConversions,
  UserManagementMapper,
  UserManagementStatus,
} from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { RoleStore } from './RoleStore';

export class Role extends BaseEntity implements IRole {
  description: string;
  usersCount: number;
  policies: IPolicy[];
  policyTemplates: IPolicyTemplate[];
  active: boolean;

  store: RoleStore;

  constructor(store: RoleStore, entity: UserManagementMapper<JsonConversions<IRoleQueryResult>>) {
    super(entity);
    this.store = store;

    this.active = entity.status === UserManagementStatus.ACTIVE;
    this.description = entity.description;
    this.usersCount = entity.usersCount;
    this.policies =
      entity.policies?.map(({ resource, entries }) => ({
        resource,
        access: Object.fromEntries(entries.map(({ subject, ...config }) => [subject, config])),
      })) ?? [];
    this.policyTemplates =
      entity.policyTemplates?.map(({ resourceType, entries }) => ({
        resourceType,
        access: Object.fromEntries(entries.map(({ subject, ...config }) => [subject, config])),
      })) ?? [];
  }
}
