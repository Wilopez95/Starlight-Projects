import { WorkOrderStatus } from '@root/consts/workOrder';
import { WorkOrderStoreSortType } from '@root/stores/workOrder/types';
import { FileWithPreview, IMedia, IWorkOrder, SortType } from '@root/types';

export interface IWorkOrdersParams {
  serviceDate: string;
  businessLineIds?: number[];
  serviceAreaIds?: number[];
  status?: WorkOrderStatus[];
  assignedRoute?: string;
  skip?: number;
  limit?: number;
  sortBy?: WorkOrderStoreSortType;
  sortOrder?: SortType;
  searchInput?: string;
  thirdPartyHaulerIds?: (number | null)[];
}

export interface IWorkOrdersBulkStatusChange {
  ids: number[];
  status: WorkOrderStatus;
  cancellationReason?: string;
  cancellationComment?: string;
}

export interface IUpdateWorkOrderParams
  extends Pick<
    IWorkOrder,
    | 'id'
    | 'dailyRouteId'
    | 'status'
    | 'pickedUpEquipment'
    | 'droppedEquipment'
    | 'weight'
    | 'serviceDate'
    | 'status'
    | 'cancellationReason'
    | 'cancellationComment'
  > {
  media?: (IMedia | FileWithPreview)[];
}

export interface IBulkRescheduleWorkOrderInput {
  ids: number[];
  serviceDate: string;
}

export interface IBulkActionWorkOrdersResult {
  valid?: number[];
  invalid?: number[];
}
