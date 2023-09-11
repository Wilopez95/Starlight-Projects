export enum ResourceLoginType {
  HAULING = 'hauling/crpt',
  CP = 'CUSTOMER_PORTAL',
}

export interface ResourceLogin {
  id: string | number;
  label: string;
  loginUrl: string;
  targetType: ResourceLoginType;
  image?: string;
  subLabel?: string;
  updatedAt?: string;
  tenantName?: string;
  hasRecyclingAccess?: boolean;
  hasGradingAccess?: boolean;
  graderHasBUAccess?: boolean;
}
