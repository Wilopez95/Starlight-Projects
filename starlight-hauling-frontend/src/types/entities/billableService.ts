import { BillableItemActionEnum, BillingCycleEnum, ProrationTypeEnum } from '@root/consts';
import { IEquipmentItem } from '@root/types';

import { IEntity } from './entity';
import { IFrequency } from './frequency';
import { BillableUnitType } from './lineItem';

export interface IBillableService extends IEntity {
  businessLineId: string;
  active: boolean;
  unit: BillableUnitType;
  description: string;
  action: BillableItemActionEnum;
  importCodes: string | null;
  equipmentItemId: number;
  materialBasedPricing: boolean;
  allowForRecurringOrders: boolean;
  oneTime: boolean;
  applySurcharges: boolean;
  spUsed: boolean;
  frequencies?: IFrequency[];
  services?: (number | IBillableService)[];
  billingCycles?: BillingCycleEnum[];
  prorationType?: ProrationTypeEnum;
  equipmentItem?: IEquipmentItem | null;
}
