import { AppliedFilterState } from '@root/core/common/TableTools/TableFilter';
import { SubscriptionTabRoutes } from '@root/core/consts';
import { SubscriptionStatusEnum } from '@root/core/types';

export type RequestOptions = {
  status?: SubscriptionStatusEnum;
  mine?: boolean;
  customerId?: number | string;
  businessLine?: string;
  jobSiteId?: number;
  serviceAreaId?: number;
  filterData?: AppliedFilterState;
};

export type SubscriptionStoreCount = Record<SubscriptionStatusEnum | 'total', number>;

export type GetCountOptions = {
  businessUnitId?: string;
  customerId?: string;
};

export type SubscriptionStoreCountResponse = {
  total: number;
  statuses: Record<SubscriptionStatusEnum, number>;
};

export type SubscriptionStoreTabRoutes =
  | SubscriptionTabRoutes.Active
  | SubscriptionTabRoutes.OnHold
  | SubscriptionTabRoutes.Closed;
