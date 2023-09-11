import { IAccessConfig } from '@root/types';

import { PermissionSectionConfig } from './config';

export interface IPermissionTree {
  permissions: PermissionSectionConfig['items'];
  policy?: { access: Record<string, IAccessConfig> };
  isAdmin?: boolean;
  path: string;
  onCheckboxClick(event: React.ChangeEvent): void;
}
