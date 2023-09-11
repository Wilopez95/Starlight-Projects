import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { difference, isDate, partition, uniqBy } from 'lodash-es';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { IWorkOrderCommentParams } from '@root/api';
import { DailyRoutesService } from '@root/api/dailyRoutes/dailyRoutes';
import {
  IUpdateWorkOrderParams,
  IWorkOrdersBulkStatusChange,
  IWorkOrdersParams,
  WorkOrdersService,
} from '@root/api/workOrders';
import { DateFormat } from '@root/consts';
import { WorkOrderStatus } from '@root/consts/workOrder';
import { ExpandedError, normalizeListOptions, NotificationHelper } from '@root/helpers';
import { IDailyRoutesListParams, IMedia, IWorkOrder, JsonConversions, SortType } from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { IWorkOrdersBulkReschedule, WorkOrderStoreSortType } from './types';
import { WorkOrder } from './WorkOrder';

export class WorkOrderStore extends BaseStore<IWorkOrder> {
  private readonly service: WorkOrdersService;

  @observable serviceDate: Date;
  @observable sortBy: WorkOrderStoreSortType = WorkOrderStoreSortType.CompletedAt;
  @observable sortOrder: SortType = 'desc';
  @observable workOrderEditQuickViewVisible: boolean;
  @observable workOrdersSelects = new Set<number>();
  @observable isOpenedRescheduleModal = false;
  @observable isOpenedUpdateStatusModal = false;
  // Local variables for quick-view filter
  businessLineIds?: number[];
  serviceAreaIds?: number[];
  status?: WorkOrderStatus[];
  assignedRoute?: string;
  searchInput?: string;
  thirdPartyHaulerIds?: (number | null)[];

  constructor(global: GlobalStore) {
    super(global);
    this.service = new WorkOrdersService();

    this.workOrderEditQuickViewVisible = false;
    this.serviceDate = new Date();
  }

  @action
  toggleWorkOrderEditQuickViewVisible(shouldOpen?: boolean): void {
    this.workOrderEditQuickViewVisible =
      shouldOpen === undefined ? !this.workOrderEditQuickViewVisible : shouldOpen;
  }

  @action.bound
  setSort(sortBy: WorkOrderStoreSortType, sortOrder: SortType) {
    this.sortOrder = sortOrder;
    this.sortBy = sortBy;
  }

  @action.bound
  setServiceDate(date: Date) {
    this.serviceDate = date;
  }

  @action.bound
  toggleUpdateStatusModal(): void {
    this.isOpenedUpdateStatusModal = !this.isOpenedUpdateStatusModal;
  }

  @action.bound
  toggleRescheduleModal(): void {
    this.isOpenedRescheduleModal = !this.isOpenedRescheduleModal;
  }

  @action.bound
  clearWorkOrdersSelects() {
    this.workOrdersSelects.clear();
  }

  @computed
  get workOrdersSelectsSize() {
    return this.workOrdersSelects.size;
  }

  @computed
  get isWorkOrdersSelectsEmpty() {
    return !this.workOrdersSelects.size;
  }

  @computed
  get workOrdersByDisplayId() {
    return this.values.reduce((acc, workOrder) => {
      const { displayId } = workOrder;

      acc.set(displayId, workOrder);

      return acc;
    }, new Map<string, IWorkOrder>());
  }

  @action.bound
  closeRescheduleModals(): void {
    this.workOrdersSelects = new Set();
    this.isOpenedRescheduleModal = false;
  }

  @action.bound
  closeUpdateStatusModals(): void {
    this.workOrdersSelects = new Set();
    this.isOpenedUpdateStatusModal = false;
  }

  @actionAsync
  async workOrdersBulkReschedule(values: Omit<IWorkOrdersBulkReschedule, 'ids'>) {
    const params = {
      serviceDate: format(new Date(values.serviceDate), DateFormat.DateSerialized),
      ids: [...this.workOrdersSelects],
    };

    const normalized = normalizeListOptions(params) as IWorkOrdersBulkReschedule;

    const { workOrdersBulkReschedule } = await task(
      this.service.workOrdersBulkReschedule(normalized),
    );

    if (workOrdersBulkReschedule?.invalid) {
      this.workOrdersSelects = new Set(workOrdersBulkReschedule.valid ?? []);

      return this.getParentWorkOrdersIds(workOrdersBulkReschedule.invalid);
    }

    return null;
  }

  @action
  toggleWOSelection(id: number) {
    this.workOrdersSelects.has(id)
      ? this.workOrdersSelects.delete(id)
      : this.workOrdersSelects.add(id);
  }

  @actionAsync
  async getDailyRoutesList(id: number, options?: IDailyRoutesListParams) {
    try {
      if (options?.serviceDate && isDate(options.serviceDate)) {
        options.serviceDate = format(options.serviceDate, DateFormat.DateSerialized);
      }

      const { dailyRoutes } = await task(
        DailyRoutesService.getDailyRoutesList(id, {
          ...options,
        }),
      );

      return dailyRoutes;
    } catch (error) {
      ExpandedError.sentryWithNotification({
        error,
        action: 'getDailyRoutesList',
      });

      return [];
    }
  }

  @actionAsync
  async getWorkOrdersList(
    id: number,
    queryOptions: Omit<IWorkOrdersParams, 'serviceDate'> = {},
    options: {
      resetOffset?: boolean;
      cleanUp?: boolean;
    } = {
      resetOffset: false,
      cleanUp: false,
    },
  ) {
    try {
      if (options.cleanUp) {
        this.cleanup();
      }

      if (options.resetOffset) {
        this.offset = 0;
      }

      this.businessLineIds = queryOptions.businessLineIds;
      this.serviceAreaIds = queryOptions.serviceAreaIds;
      this.status = queryOptions.status;
      this.assignedRoute = queryOptions.assignedRoute;
      this.thirdPartyHaulerIds = queryOptions.thirdPartyHaulerIds;

      await task(this.queryWorkOrders(id));
    } catch (error) {
      ExpandedError.sentryWithNotification({
        error,
        action: 'getWorkOrdersList',
      });
      this.loaded = true;
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async onSearch(businessUnitId: number, searchInput: string) {
    try {
      this.cleanup();
      this.loading = true;

      this.searchInput = searchInput ? searchInput : undefined;

      await task(this.queryWorkOrders(businessUnitId));
    } catch (error) {
      console.error('Get Work Order List Search Request Error', error);
      this.loaded = true;
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  private async queryWorkOrders(businessUnitId: number) {
    this.loading = true;

    const normalized = normalizeListOptions({
      businessLineIds: this.businessLineIds,
      serviceAreaIds: this.serviceAreaIds,
      status: this.status,
      assignedRoute: this.assignedRoute,
      thirdPartyHaulerIds: this.thirdPartyHaulerIds,
    });

    const { workOrders } = await task(
      this.service.getWorkOrdersList(
        businessUnitId,
        {
          ...(normalized as IWorkOrdersParams),
          serviceDate: format(this.serviceDate, DateFormat.DateSerialized),
          //ToDo: implement better the params to get a good first load and a lazy load
          // limit: this.limit,
          // skip: this.offset,
          // sortBy: this.sortBy,
          // sortOrder: this.sortOrder,
        },
        this.searchInput,
      ),
    );

    this.validateLoading(workOrders, this.limit);

    if (workOrders.length) {
      this.setItems(workOrders.map(workOrder => new WorkOrder(this, workOrder)));

      this.offset += this.limit;
    }
  }

  @actionAsync
  async workOrdersBulkStatusChange(options: Omit<IWorkOrdersBulkStatusChange, 'ids'>) {
    try {
      const normalized = normalizeListOptions({
        ids: [...this.workOrdersSelects],
        ...options,
      });

      const { workOrdersBulkStatusChange } = await task(
        this.service.workOrdersBulkStatusChange(normalized as IWorkOrdersBulkStatusChange),
      );

      if (workOrdersBulkStatusChange?.invalid) {
        this.workOrdersSelects = new Set(workOrdersBulkStatusChange.valid ?? []);

        return this.getParentWorkOrdersIds(workOrdersBulkStatusChange.invalid);
      }

      NotificationHelper.success('workOrdersBulkStatusChange');

      return null;
    } catch (error) {
      ExpandedError.sentryWithNotification({
        error,
        action: 'workOrdersBulkStatusChange',
      });
    }
  }

  @actionAsync
  async updateWorkOrder(data: IUpdateWorkOrderParams, workOrder: IWorkOrder) {
    try {
      this.toggleQuickViewLoading();

      const { media, ...restData } = data;
      const [filesToUpload, filesExisted] = partition(media, file => file instanceof File) as [
        File[],
        IMedia[],
      ];

      const filesToRemoveIds = difference(workOrder.media, filesExisted).map(({ id }) => id);

      const updatedWorkOrder: JsonConversions<{
        updateWorkOrder: IWorkOrder;
      }> = await this.service.updateWorkOrder(restData);

      if (filesToRemoveIds.length) {
        await this.service.deleteWorkOrderMedia(filesToRemoveIds, workOrder.id);
      }

      const differenceResult = differenceInCalendarDays(
        parseISO(data.serviceDate),
        this.serviceDate,
      );

      const services = [];
      if (filesToUpload.length) {
        services.push(
          ...filesToUpload.map(mediaFile => this.service.updateWorkOrderMedia(data.id, mediaFile)),
        );
      }

      const uploadedItems = await Promise.all(services);
      const successfullyUploaded: IMedia[] = [];
      uploadedItems.forEach(item => {
        successfullyUploaded.push(item.uploadWorkOrderMedia[0]);
      });
      updatedWorkOrder.updateWorkOrder.media = uniqBy(
        [...(updatedWorkOrder.updateWorkOrder.media ?? []), ...successfullyUploaded],
        'id',
      );

      const workOrderItem = new WorkOrder(this, updatedWorkOrder.updateWorkOrder);

      NotificationHelper.success('updateWorkOrder', workOrder.displayId);

      if (differenceResult === 0) {
        this.setItem(workOrderItem);
      } else {
        this.removeEntity(workOrder.id);

        return workOrderItem;
      }
    } catch (error) {
      ExpandedError.sentryWithNotification({ error, action: 'updateWorkOrder' }, [workOrder.id]);
    } finally {
      this.toggleQuickViewLoading();
    }
  }

  @actionAsync
  async fetchWorkOrderById(id: string) {
    try {
      const { workOrder } = await task(this.service.getWorkOrder(id));

      // Save order to store, because calendar may be different and we need open order from details to edit view
      const newWorkOrder = new WorkOrder(this, workOrder);

      const differenceResult = differenceInCalendarDays(
        new Date(newWorkOrder.serviceDate),
        this.serviceDate,
      );

      if (differenceResult === 0) {
        this.setItem(newWorkOrder);
      }

      return newWorkOrder;
    } catch (error) {
      console.error('Get work order', error);
    }
  }

  @action.bound
  addComment(workOrderId: number, comment: IWorkOrderCommentParams) {
    const workOrder = this.getById(workOrderId);

    if (workOrder) {
      workOrder.comments?.push(comment);
      this.setItem({
        ...workOrder,
      });
    }
  }

  @action.bound
  private getParentWorkOrdersIds(ids: number[]) {
    return ids.reduce<number[]>((acc, id) => {
      const workOrder = this.getById(id);

      if (workOrder) {
        acc.push(workOrder.orderId);
      }

      return acc;
    }, []);
  }
}
