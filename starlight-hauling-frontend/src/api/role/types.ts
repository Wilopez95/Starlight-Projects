import { IPolicyEntries, IPolicyTemplateEntries, IRole } from '@root/types';

export interface IRoleInput {
  active: boolean;
  description: string;
  policies: IPolicyEntries[];
  policyTemplates: IPolicyTemplateEntries[];
}

export interface IRoleQueryResult extends Omit<IRole, 'policies' | 'policyTemplates'> {
  policies: IPolicyEntries[];
  policyTemplates: IPolicyTemplateEntries[];
}
