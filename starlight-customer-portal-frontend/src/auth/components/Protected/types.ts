export type Permission = 'customer-portal:profile:update';

export interface IProtected {
  permissions: Permission | Permission[];
  fallback?: React.ReactNode;
}
