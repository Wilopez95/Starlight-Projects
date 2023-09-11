import { ApiError } from '@root/api/base/ApiError';
import { AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { IRevertOrderStatusData } from '@root/components/forms/RevertOrderStatus/types';
import { ITransitionSubscriptionOrderStatus, SubscriptionOrderStatusEnum } from '@root/types';

export type SubscriptionOrdersStoreSortType =
  | 'id'
  | 'assignedRoute'
  | 'service'
  | 'jobSiteId'
  | 'serviceDate'
  | 'comment'
  | 'status'
  | 'total'
  | 'jobSite';

export type RequestOptions = {
  filterData?: AppliedFilterState;
  search?: string;
};

export type RequestOptionsBySubscriptionId = {
  subscriptionId: number;
  filterData?: AppliedFilterState;
};

export interface ISubscriptionOrderCounts {
  total: number;
  statuses?: Record<SubscriptionOrderStatusEnum, number>;
}

export type UpdateStatusRequest = {
  id: number;
  subscriptionOrder: ITransitionSubscriptionOrderStatus;
  businessUnitId: string;
  refreshCount: boolean;
  sequenceId: string;
};

export type RevertStatusRequest<T = IRevertOrderStatusData> = {
  id: number;
  data: T;
  businessUnitId: string;
  refreshCount: boolean;
  sequenceId: string;
};

export type RefreshData = {
  id: number;
  businessUnitId: string;
  refreshCount: boolean;
};

export type HandleTransitionStatusError = {
  id: number;
  status: SubscriptionOrderStatusEnum;
  error: ApiError;
};
