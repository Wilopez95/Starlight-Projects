import { SubscriptionOrders } from '../database/entities/tenant/SubscriptionOrders';
import { Subscriptions } from '../database/entities/tenant/Subscriptions';
import { SubscriptionServiceItem } from '../database/entities/tenant/SubscriptionServiceItem';
import { IFrequency } from './Frequency';
import { IOrderIncludedLineItem } from './LineItems';
import { IMaterial } from './Material';

export interface ISubscriptionServiceItemBillableService {
  description?: string;
}
export interface ISubscriptionServiceItem extends SubscriptionServiceItem {
  billableService?: ISubscriptionServiceItemBillableService;
  serviceFrequency?: IFrequency[];
  material?: IMaterial;
  subscriptionOrders?: SubscriptionOrders[];
  lineItems?: IOrderIncludedLineItem[];
  description?: string;
}

export interface IDetailsForRoutePlannerResponse {
  businessUnitId?: number;
  businessLineId?: number;
  jobSiteNote?: string;
  subscriptionId?: number;
  serviceItemId?: number;
  customerId?: number;
  jobSiteId?: number;
  materialId?: number;
  serviceAreaId?: number;
  jobSiteContactId?: number;
  billableServiceId?: number;
  billableServiceDescription?: string;
  equipmentItemId?: number;
  equipmentItemSize?: number | null;
}

export interface GetDetailsForRoutePlanner extends SubscriptionServiceItem {
  subscription: Subscriptions;
}
