export enum ResourceLoginType {
  GLOBAL = 'globalSystem',
  RECYCLING_FACILITY = 'recyclingFacility',
  HAULING = 'hauling/crpt',
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
}

export interface BusinessUnitResourceLogin extends ResourceLogin {
  id: number;
  subLabel: string;
  targetType: ResourceLoginType.RECYCLING_FACILITY | ResourceLoginType.HAULING;
}
