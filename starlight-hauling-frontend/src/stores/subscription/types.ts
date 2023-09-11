import { AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { BillingCycleEnum, SubscriptionTabRoutes } from '@root/consts';
import { SubscriptionStatusEnum } from '@root/types';
import { IFrequency } from '@root/types/entities/frequency';

export type RequestOptions = {
  businessUnitId: string;
  status?: SubscriptionStatusEnum;
  mine?: boolean;
  customerId?: number | string;
  businessLine?: string;
  jobSiteId?: number;
  serviceAreaId?: number;
  filterData?: AppliedFilterState;
  sortBy?: string;
};

export type SubscriptionStoreCount = Record<
  SubscriptionStatusEnum | 'total' | 'filteredTotal',
  number
>;

export type GetCountOptions = {
  businessUnitId: string;
  customerId?: string;
};

export type SubscriptionStoreTabRoutes =
  | SubscriptionTabRoutes.Active
  | SubscriptionTabRoutes.OnHold
  | SubscriptionTabRoutes.Closed;

export type SubscriptionsAvailableFilters = {
  businessLine: number[];
  billingCycle: BillingCycleEnum[];
  serviceFrequency: IFrequency[];
};

export type SubscriptionDraftSortType =
  | 'startDate'
  | 'id'
  | 'serviceFrequency'
  | 'jobSiteId'
  | 'nextServiceDate'
  | 'billingCycle'
  | 'billingCyclePrice'
  | 'customerName'
  | 'service'
  | 'businessLine';
