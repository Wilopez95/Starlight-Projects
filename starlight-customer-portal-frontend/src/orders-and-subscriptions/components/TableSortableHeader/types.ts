import { SubscriptionStore } from '@root/orders-and-subscriptions/stores/subscription/SubscriptionStore';
import { SubscriptionDraftStore } from '@root/orders-and-subscriptions/stores/subscriptionDraft/SubscriptionDraftStore';

export interface ITableSortableHeader {
  requestOptions: RequestOptions;
  tableRef: React.MutableRefObject<HTMLDivElement | null>;
  relatedStore: Store;
  sortableTableTitle: NonNullable<SortableTableTitles>;
}

export type RequestOptions = {
  customerId?: string | number;
};

export type Store = SubscriptionDraftStore | SubscriptionStore;

export enum SortableTableTitles {
  customerSubscriptions = 'Customer Subscriptions',
}

export type SortKey =
  | 'billingCycle'
  | 'billingCyclePrice'
  | 'businessLine'
  | 'customerName'
  | 'id'
  | 'jobSiteId'
  | 'nextServiceDate'
  | 'payment'
  | 'service'
  | 'serviceDate'
  | 'serviceFrequency'
  | 'startDate'
  | 'totalAmount'
  | 'serviceName';

export interface CellParams {
  title: string;
  sortKey: SortKey;
}
