import { ResourceType } from '../enums/resourceType';

import { IEntity } from '.';

export enum AccessLevel {
  NO_ACCESS = 'NO_ACCESS',
  READ = 'READ',
  MODIFY = 'MODIFY',
  FULL_ACCESS = 'FULL_ACCESS',
}

export interface IAccessConfig {
  level: AccessLevel;
  overridden?: boolean;
}

export interface IPolicyEntry extends IAccessConfig {
  subject: string;
}

export interface IPolicy {
  resource: string;
  access: Record<string, IAccessConfig>;
}

export interface IPolicyTemplate {
  resourceType: ResourceType;
  access: Record<string, IAccessConfig>;
}

export interface IPolicyEntries {
  resource: string;
  entries: IPolicyEntry[];
}

export interface IPolicyTemplateEntries {
  resourceType: ResourceType;
  entries: IPolicyEntry[];
}

export interface IRole extends IEntity {
  active: boolean;
  description: string;
  usersCount: number;
  policies: IPolicy[];
  policyTemplates: IPolicyTemplate[];
}
