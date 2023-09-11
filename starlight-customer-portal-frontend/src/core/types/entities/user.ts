import { ResourceType } from '../enums';
import type { PermissionMode } from '../enums/permissionMode';

import type { IAddress, IEntity, IPhoneNumber } from './';
import type { IUserRole } from './userRole';

export interface IUserCompiledPermission {
  name: string;
  mode: PermissionMode;
  userMode: PermissionMode;
  availableModes: PermissionMode[];
}

export interface IUserResourcePermissions {
  resource: string;
  type: ResourceType;
  permissions: IUserCompiledPermission[];
}

export interface IUser extends IEntity {
  active: boolean;
  email: string;
  name: string;
  roles: IUserRole[];
  phones: Omit<IPhoneNumber, 'id'>[];
  resourcePermissions: IUserResourcePermissions[];
  hasPersonalPrivileges: boolean;
  firstName?: string;
  lastName?: string;
  title?: string;
  address?: Omit<IAddress, 'id'>;
}
