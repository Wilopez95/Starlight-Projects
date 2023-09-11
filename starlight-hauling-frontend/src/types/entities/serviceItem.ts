import { VersionedEntity } from '../helpers';

import { ISubscriptionOrder } from './subscriptionOrder/subscriptionOrder';
import { IBillableService } from './billableService';
import { IEntity } from './entity';
import { IFrequency } from './frequency';
import { IMaterial } from './material';
import { IOrderLineItem } from './order';

export interface IServiceDaysOfWeek {
  [dayNumber: number]: {
    requiredByCustomer: boolean;
    route?: string;
  };
}

export interface IServiceItem extends IEntity {
  billableService: VersionedEntity<IBillableService>;
  billableServiceId: number;
  customRatesGroupServicesId: number | null;
  globalRatesRecurringServicesId: number;
  material: VersionedEntity<IMaterial>;
  price: number;
  quantity: number | string;
  subscriptionId: number;
  serviceFrequencyId: number | null;
  lineItems: (IOrderLineItem & { unlockOverrides: boolean; price: number })[]; // TODO: create separate interface or type
  subscriptionOrders: ISubscriptionOrder[];
  effectiveDate: Date | null;
  unlockOverrides: boolean;
  serviceDaysOfWeek?: IServiceDaysOfWeek;
  nextPrice?: number;
  serviceFrequency?: IFrequency[];
  isDeleted?: boolean;
}

export type SubscriptionOrderServiceItem = Omit<IServiceItem, 'lineItems' | 'subscriptionOrders'>;
