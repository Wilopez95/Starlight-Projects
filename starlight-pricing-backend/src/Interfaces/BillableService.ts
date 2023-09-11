import { IEquipmentItem } from './EquipmentItem';
import { IFrequency } from './Frequency';

export interface IBillableService {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  businessLineId: string;
  active: boolean;
  unit: string;
  description: string;
  action: string;
  importCodes: string | null;
  equipmentItemId: number;
  materialBasedPricing: boolean;
  allowForRecurringOrders: boolean;
  oneTime: boolean;
  applySurcharges: boolean;
  spUsed: boolean;
  frequencies?: IFrequency[];
  services?: number[];
  billingCycles?: string[];
  prorationType?: string;
  equipmentItem?: IEquipmentItem | null;
  originalId?: number;
}

export interface IGetBillableServiceBySubscriptionData {
  id: number;
  types: string;
  excludeTypes: string[];
}
export interface IGetBillableServiceBySubscription {
  data: IGetBillableServiceBySubscriptionData;
}
