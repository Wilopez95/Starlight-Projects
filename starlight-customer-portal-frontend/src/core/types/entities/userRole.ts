import { PermissionMode } from '../enums/permissionMode';
import { ResourceType } from '../enums/resourceType';

import { IEntity } from '.';

export interface ICompiledPermission {
  name: string;
  mode: PermissionMode;
  availableModes: PermissionMode[];
}

export interface IResourcePermissions {
  resource: string;
  type: ResourceType;
  permissions: ICompiledPermission[];
}

export interface IUserRole extends IEntity {
  active: boolean;
  description: string;
  usersCount: number;
  resourcePermissions: IResourcePermissions[];
}
