import { IEntity } from './Entity';

export interface IPurchaseOrder extends IEntity {
  active: boolean;
  poNumber: string;
  poAmount: number | null;
  effectiveDate: Date | null;
  expirationDate: Date | null;
  businessLineIds: number[];
  customerId: string;
  isOneTime: boolean;
  levelApplied?: string[];
  isDefaultByCustomer?: boolean;
}
