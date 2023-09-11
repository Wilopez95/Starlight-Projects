export enum UserManagementStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export type UserManagementMapper<T> = T extends { active: true }
  ? Omit<T, 'active'> & { status: UserManagementStatus.ACTIVE }
  : T extends { active: false }
  ? Omit<T, 'active'> & { status: UserManagementStatus.DISABLED }
  : T extends { active: boolean }
  ? Omit<T, 'active'> & { status: UserManagementStatus }
  : T;
