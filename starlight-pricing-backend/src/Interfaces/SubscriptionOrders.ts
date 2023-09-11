import { SubscriptionLineItem } from '../database/entities/tenant/SubscriptionLineItem';
import { SubscriptionOrders } from '../database/entities/tenant/SubscriptionOrders';
import { SubscriptionOrdersLineItems } from '../database/entities/tenant/SubscriptionOrdersLineItems';
import { SubscriptionOrderMedia } from '../database/entities/tenant/SubscriptionOrdersMedia';
import { Subscriptions } from '../database/entities/tenant/Subscriptions';
import { SubscriptionServiceItem } from '../database/entities/tenant/SubscriptionServiceItem';
import { IBillableService } from './BillableService';
import { IBusinessLine } from './BusinessLine';
import { IBusinessUnit } from './BusinessUnit';
import { IContact } from './Contact';
import { ICustomer } from './Customer';
import { IJobSite } from './JobSite';
import { ILineItem } from './LineItems';
import { IPurchaseOrder } from './PurchaseOrder';

export interface ISubscriptionOrdersResolver {
  price_id: number;
  price_group_historical_id: number;
}

export interface ITupleConditions {
  [key: string]: string;
}

export interface ISubscriptionOrders extends SubscriptionOrders {
  tempNextServiceDate: SubscriptionServiceItem;
}

export interface IUpdateSubscriptionOrderStatus extends SubscriptionOrders {
  subscription: Subscriptions;
}

export interface ISubscriptionOrderStatusElement {
  ids: number[];
  businessUnitId: number;
  status: string;
  validOnly: boolean;
}

export interface IBatchUpdateSubscriptionOrder {
  data: ISubscriptionOrderStatusElement;
}

export interface ISubscriptionOrdersCount {
  count: number;
  status: string;
}

export interface IExtendedSubscriptionLineItems extends SubscriptionOrdersLineItems {
  historicalLineItem?: ILineItem;
}

/* AT - I commented this out to get passed lint checks. It's not currently being used since 
I changed the implementation but I'm not sure if we will use it in the future
 export interface ISubscriptionOrderServiceItem extends SubscriptionServiceItem {
   material?: IMaterial;
 }
 */

export interface ISubscriptionOrdersExtends extends SubscriptionOrders {
  jobSite?: IJobSite;
  businessUnit?: IBusinessUnit;
  businessLine?: IBusinessLine;
  customer?: ICustomer;
  lineItems?: IExtendedSubscriptionLineItems[] | SubscriptionLineItem[];
  billableService?: IBillableService;
  thirdPartyHaulerDescription?: string;
  purchaseOrder?: IPurchaseOrder;
  // subscriptionServiceItem: ISubscriptionOrderServiceItem | null;
  subscriptionContact?: IContact;
  mediaFiles: SubscriptionOrderMedia[];
  billableLineItemsTotal: number;
  subscription?: Subscriptions;
}
