import { BillableItemActionEnum, BillingCycle, ProrationTypeEnum } from '@root/core/consts';

import { IEntity } from './entity';
import { IFrequency } from './frequency';
import { BillableUnitType } from './lineItem';

export interface IBillableService extends IEntity {
  businessLineId: string;
  active: boolean;
  unit: BillableUnitType;
  description: string;
  action: BillableServiceActionType;
  importCodes: string | null;
  equipmentItemId: number;
  materialBased: boolean;
  allowForRecurringOrders: boolean;
  oneTime: boolean;
  frequencies?: IFrequency[];
  services?: number[] | IBillableService[];
  billingCycles?: BillingCycle[];
  prorationType?: ProrationTypeEnum;
}

export type BillableServiceActionType =
  | BillableItemActionEnum.none
  | BillableItemActionEnum.delivery
  | BillableItemActionEnum.switch
  | BillableItemActionEnum.final
  | BillableItemActionEnum.relocate
  | BillableItemActionEnum.reposition
  | BillableItemActionEnum.dumpReturn
  | BillableItemActionEnum.liveLoad
  | BillableItemActionEnum.generalPurpose
  | BillableItemActionEnum.rental
  | BillableItemActionEnum.service;
