import { IOrderLineItem } from '@root/orders-and-subscriptions/types/entities/order';

import { VersionedEntity } from '../helpers';

import { IBillableService } from './billableService';
import { IEntity } from './entity';
import { IFrequency } from './frequency';
import { IMaterial } from './material';
import { ISubscriptionOrder } from './subscriptionOrder';

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
  lineItems: IOrderLineItem[];
  subscriptionOrders: ISubscriptionOrder[];
  effectiveDate: Date | null;
  serviceDaysOfWeek?: IServiceDaysOfWeek;
  nextPrice?: number;
  serviceFrequency?: IFrequency;
  isDeleted?: boolean;
}
