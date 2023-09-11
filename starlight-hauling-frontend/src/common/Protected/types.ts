import { Permission } from '@root/hooks/permissions/types';

export interface IProtected {
  permissions: Permission | Permission[];
  fallback?: React.ReactNode;
}
