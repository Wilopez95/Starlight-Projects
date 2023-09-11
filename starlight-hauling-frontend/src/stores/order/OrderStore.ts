import * as Sentry from '@sentry/react';
import {
  AdditionalOrderData,
  InitQueryFuncType,
} from '@starlightpro/recycling/hooks/useAdditionalOrderData';
import { format } from 'date-fns';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { IDroppedEquipmentItem, OrderService } from '@root/api';
import { type ApiError } from '@root/api/base/ApiError';
import { ICancelOrderData } from '@root/components/forms/CancelOrder/types';
import { IRescheduleOrderData } from '@root/components/forms/RescheduleOrder/types';
import { IRevertOrderStatusData } from '@root/components/forms/RevertOrderStatus/types';
import { OrderErrorCodes } from '@root/consts/orderErrorCodes';
import { convertDates, formatTime, NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { dateFormatsEnUS } from '@root/i18n/format/date';
import { NewPayment } from '@root/modules/billing/types';
import { INewOrders } from '@root/pages/NewRequest/NewRequestForm/forms/Order/types';
import {
  IOrder,
  type IApproveOrFinalizeMultipleRequest,
  type IConfigurableOrder,
  type IWorkOrderMediaFile,
  type OrderHistory,
  type OrderStatusType,
  type OrderStoreCountResponse,
  type OrderStoreStatusType,
} from '@root/types';

import { BaseStore } from '../base/BaseStore';
import { Order } from '../entities';
import type GlobalStore from '../GlobalStore';

import { ConvertDateFields, DeepMap } from '../../types/helpers/JsonConversions';
import { convertOrderStoreCounts } from './helpers';
import { mapCompletedOrder, mapNewOrderRequest, sanitizeEditOrder } from './sanitize';
import {
  type GetCountOptions,
  type OrderStoreCount,
  type OrderStoreSortType,
  type RequestOptions,
} from './types';

const fallbackCounts: OrderStoreCountResponse = {
  total: 0,
  filteredTotal: 0,
  statuses: {
    inProgress: 0,
    completed: 0,
    approved: 0,
    finalized: 0,
    invoiced: 0,
    canceled: 0,
  },
};

export class OrderStore extends BaseStore<Order, OrderStoreSortType> {
  private readonly service: OrderService = new OrderService();

  @observable allCounts?: OrderStoreCount;
  @observable myCounts?: OrderStoreCount;
  @observable detailsOpen = false;
  @observable editOpen = false;
  @observable detailsLoading = false;
  @observable showCanceled = true;
  @observable processedIndex = -1;
  @observable paymentError = false;
  @observable ratesError = false;
  @observable isOrderStatusChanged = false;

  // TODO: move these fields to some state local to new request page, not global store.
  @observable assignEquipmentOptions: IDroppedEquipmentItem[] = [];
  @observable assignedEquipmentItems: string[] = [];

  @observable private _selectedOrderStatus: OrderStatusType = 'inProgress';

  private creatingOrdersWithEquipment = new Set<number | string>();

  constructor(global: GlobalStore) {
    super(global, 'id', 'desc');
  }

  @action.bound
  toggleShowCanceledOrders(options: RequestOptions) {
    this.showCanceled = !this.showCanceled;
    this.cleanup();
    this.requestCount(options);
    this.request(options);
  }

  @action
  checkAll(value: boolean) {
    this.values.forEach(order => (order.checked = value));
  }

  @computed
  get checkedOrders() {
    return this.values.filter(order => order.checked);
  }

  @computed
  get isAllChecked() {
    const orders = this.values;
    const loading = this.loading;

    return this.checkedOrders.length === orders.length && orders.length > 0 && !loading;
  }

  @action
  maybeHideAssignEquipmentOptions(orderKey: string | number) {
    this.creatingOrdersWithEquipment.delete(orderKey);

    if (this.creatingOrdersWithEquipment.size === 0) {
      this.setAssignEquipmentOptions([]);
    }
  }

  @action
  setAssignEquipmentOptions(assignEquipmentOptions: IDroppedEquipmentItem[]) {
    this.assignEquipmentOptions = assignEquipmentOptions.map(option => ({
      ...option,
      id: option.id.toString(),
    }));
  }

  @action
  addAssignedEquipmentItem(equipmentOptionId: string) {
    this.assignedEquipmentItems.push(equipmentOptionId);
  }

  @action
  removeAssignedEquipmentItem(equipmentOptionId: string) {
    const index = this.assignedEquipmentItems.indexOf(equipmentOptionId);

    if (index !== -1) {
      this.assignedEquipmentItems.splice(index, 1);
    }
  }

  @action
  resetAssignedEquipmentItems() {
    this.creatingOrdersWithEquipment.clear();
    this.assignedEquipmentItems = [];
  }

  getCounts(mine: boolean) {
    return mine ? this.myCounts : this.allCounts;
  }

  getTabSize(tab: OrderStoreStatusType, mine: boolean) {
    const counts = this.getCounts(mine);

    if (!counts) {
      return 0;
    }

    return counts[tab];
  }

  @action
  openDetails(order: Order) {
    this.detailsOpen = true;
    this.selectEntity(order, false);
    this.toggleQuickView(false);
    this.requestDetails({ orderId: order.id, edit: true, shouldOpenDetailsQuickView: true });
  }

  @action.bound
  openEdit(order: Order) {
    this.editOpen = true;
    this.toggleQuickView(false);
    this.requestDetails({ orderId: order.id, edit: true });
  }

  @action.bound
  closeDetails() {
    this.detailsOpen = false;
  }

  @action.bound
  closeEdit() {
    this.editOpen = false;
    this.isOrderStatusChanged = false;
    this.isOpenQuickView = false;
  }

  @action.bound
  closeCustomerDetails() {
    this.editOpen = false;
    this.detailsOpen = false;
    this.isOpenQuickView = true;
    if (this.selectedEntity) {
      this.requestDetails({ edit: true, orderId: this.selectedEntity.id });
    }
  }

  @action.bound openNextDetails() {
    if (this.processedIndex < 0) {
      return;
    }

    const newIndex = this.processedIndex;

    this.processedIndex = -1;

    const orders = this.values;

    if (!orders[newIndex]) {
      return;
    }
    const newOrder = orders[newIndex];

    this.openDetails(newOrder);
  }

  @actionAsync
  async request({ filterData = {}, ...options }: RequestOptions) {
    if (this.loading) {
      return;
    }
    this._selectedOrderStatus = options.status;

    this.loading = true;

    try {
      const response = await task(
        this.service.get({
          limit: this.limit,
          skip: this.offset,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          finalizedOnly: !this.showCanceled,
          ...options,
          ...filterData,
        }),
      );

      const firstOrderStatus = response[0]?.status as string;

      if (firstOrderStatus && firstOrderStatus !== this._selectedOrderStatus) {
        if (options.status !== 'finalized') {
          return;
        }

        if (firstOrderStatus !== 'canceled' && firstOrderStatus !== 'finalized') {
          return;
        }
      }

      this.validateLoading(response, this.limit);

      const orders = response.map(order => new Order(this, order));

      this.setItems(orders);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          filterData,
          ...options,
        },
        message: `Orders Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async requestCount({ businessUnitId, filterData, query }: GetCountOptions) {
    try {
      const [countResponse, myCountResponse] = await task(
        Promise.all([
          this.service
            .getCount({
              finalizedOnly: !this.showCanceled,
              businessUnitId,
              query,
              ...filterData,
            })
            .catch(() => fallbackCounts),
          this.service
            .getCount({
              mine: true,
              businessUnitId,
              query,
              ...filterData,
            })
            .catch(() => fallbackCounts),
        ]),
      );

      this.allCounts = convertOrderStoreCounts(countResponse);
      this.myCounts = convertOrderStoreCounts(myCountResponse);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          businessUnitId,
          filterData,
          query,
        },
        message: `Orders Count Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async loadAssignEquipmentOptions(
    orderKey: string | number,
    params: {
      customerId: number;
      jobSiteId: number;
      equipmentItemSize: string;
      businessUnitId: string;
      businessLineId: string;
    },
  ) {
    this.creatingOrdersWithEquipment.add(orderKey);

    try {
      const options = await OrderService.getDroppedEquipmentItems(params);

      this.setAssignEquipmentOptions(options);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.setAssignEquipmentOptions([]);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          orderKey,
          ...params,
        },
        message: `Orders Load Assign Equipment Options Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestMediaFiles(order: Order): Promise<IWorkOrderMediaFile[]> {
    const maybeWorkOrderId = order.workOrder?.id;

    if (!maybeWorkOrderId) {
      return [];
    }

    try {
      const mediaFilesResponse = await this.service.requestMediaFiles(order.id, maybeWorkOrderId);
      const mediaFiles = mediaFilesResponse.map(convertDates);

      order.setWorkOrderMediaFiles(mediaFiles);

      return mediaFiles;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          ...order,
        },
        message: `Orders Request Media Files Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    return [];
  }

  @actionAsync
  async reschedule(order: Order, data: IRescheduleOrderData) {
    const { bestTimeToComeFrom, bestTimeToComeTo } = formatTime(data);

    try {
      await task(
        this.service.reschedule(order.id, {
          ...data,
          bestTimeToComeFrom,
          bestTimeToComeTo,
          serviceDate: format(data.serviceDate, dateFormatsEnUS.ISO),
        }),
      );

      NotificationHelper.success('rescheduleOrder');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      if (typedError?.response?.code === OrderErrorCodes.RatesNotFound) {
        this.ratesError = true;
      } else {
        NotificationHelper.error('rescheduleOrder', typedError?.response?.code as ActionCode);
      }
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          order,
          data,
        },
        message: `Orders Reschedule Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async cancel({
    order,
    data,
    shouldDeleteFromStore,
  }: {
    order: Order;
    data: ICancelOrderData;
    shouldDeleteFromStore: boolean;
  }) {
    try {
      await task(this.service.cancel(order.id, data));
      this.requestCount({
        businessUnitId: order.businessUnit.id.toString(),
      });
      NotificationHelper.success('cancelOrder', order.id);
      if (shouldDeleteFromStore) {
        this.removeEntity(order.id);
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      if (typedError?.response?.code === OrderErrorCodes.RatesNotFound) {
        this.ratesError = true;
      } else {
        NotificationHelper.error('cancelOrder', typedError?.response?.code as ActionCode, order.id);
      }
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          order,
          data,
        },
        message: `Orders Cancel Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async approve({
    order,
    shouldDeleteFromStore,
  }: {
    order: IConfigurableOrder;
    shouldDeleteFromStore: boolean;
  }) {
    const orderData = mapCompletedOrder(order);

    try {
      this.clearPreconditionFailedError();
      await task(this.service.approveOrder(order.id, orderData));
      this.processedIndex = this.values.findIndex(o => o.id === order.id);
      if (shouldDeleteFromStore) {
        this.removeEntity(order.id);
      }

      this.requestCount({
        businessUnitId: order.businessUnit.id,
      });

      NotificationHelper.success('approveOrder', order.id);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.paymentError = typedError?.response?.code === OrderErrorCodes.PaymentRequired;
      this.validatePreconditionError(typedError);

      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        const updatedOrder = await task(this.service.getById(order.id));

        if (updatedOrder.status !== 'completed' && shouldDeleteFromStore) {
          this.removeEntity(order.id);
        }
      } else if (!this.paymentError) {
        NotificationHelper.error('approveOrder', typedError?.response?.code as ActionCode);
        Sentry.addBreadcrumb({
          category: 'Order',
          data: {
            ...order,
          },
          message: `Orders Approve Error ${JSON.stringify(typedError?.message)}`,
        });
        Sentry.captureException(typedError);
      }
    }
  }

  @actionAsync
  async finalize({
    order,
    shouldDeleteFromStore,
  }: {
    order: IConfigurableOrder;
    shouldDeleteFromStore: boolean;
  }) {
    const orderData = mapCompletedOrder(order);

    try {
      this.clearPreconditionFailedError();
      await task(this.service.finalizeOrder(order.id, orderData));
      this.processedIndex = this.values.findIndex(o => o.id === order.id);

      if (shouldDeleteFromStore) {
        this.removeEntity(order.id);
      }

      this.requestCount({
        businessUnitId: order.businessUnit.id,
      });

      NotificationHelper.success('finalizeOrder', order.id);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.paymentError = typedError?.response?.code === OrderErrorCodes.PaymentRequired;
      this.validatePreconditionError(typedError);

      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        const updatedOrder = await task(this.service.getById(order.id));

        if (updatedOrder.status !== 'approved' && shouldDeleteFromStore) {
          this.removeEntity(order.id);
        }
      } else if (!this.paymentError) {
        NotificationHelper.error('finalizeOrder', typedError?.response?.code as ActionCode);
        Sentry.addBreadcrumb({
          category: 'Order',
          data: {
            ...order,
          },
          message: `Orders Finalize Error ${JSON.stringify(typedError?.message)}`,
        });
        Sentry.captureException(typedError);
      }
    }
  }

  @actionAsync
  async unapprove({
    order,
    data,
    shouldDeleteFromStore,
  }: {
    order: Order;
    data: IRevertOrderStatusData;
    shouldDeleteFromStore: boolean;
  }) {
    try {
      await task(this.service.unapprove(order.id, data));
      this.processedIndex = -1;
      this.requestCount({
        businessUnitId: order.businessUnit.id,
      });
      if (shouldDeleteFromStore) {
        this.removeEntity(order.id);
      }
      NotificationHelper.success('unapproveOrder', order.id);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('unapproveOrder', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          ...order,
        },
        message: `Orders Unapprove Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async unfinalize({
    data,
    order,
    shouldDeleteFromStore,
  }: {
    order: Order;
    data: IRevertOrderStatusData;
    shouldDeleteFromStore: boolean;
  }) {
    try {
      await task(this.service.unfinalize(order.id, data));
      this.requestCount({
        businessUnitId: order.businessUnit.id,
      });
      this.processedIndex = -1;

      if (shouldDeleteFromStore) {
        this.removeEntity(order.id);
      }
      NotificationHelper.success('unfinalizeOrder', order.id);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('unfinalizeOrder', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          ...order,
        },
        message: `Orders Unfinalize Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestDetails({
    orderId,
    shouldOpenQuickView = false,
    shouldOpenDetailsQuickView = false,
    edit,
  }: {
    orderId: number;
    shouldOpenQuickView?: boolean;
    shouldOpenDetailsQuickView?: boolean;
    edit?: boolean;
  }) {
    this.detailsLoading = true;
    try {
      const order = await task(this.service.getById(orderId, { edit }));

      const detailedOrder = new Order(this, order);

      this.setItem(detailedOrder);
      this.selectEntity(detailedOrder, shouldOpenQuickView);
      if (shouldOpenDetailsQuickView) {
        this.detailsOpen = true;
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          orderId,
          shouldOpenQuickView,
          shouldOpenDetailsQuickView,
          edit,
        },
        message: `Orders Request Details Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.detailsLoading = false;
  }

  @actionAsync
  async syncWithDispatch(order: Order, closeQuickView: () => void): Promise<Order | null> {
    try {
      const syncResult = await task(this.service.syncWithDispatch(order.id));

      if (syncResult.status !== order.status) {
        this.requestCount({
          businessUnitId: order.businessUnit.id,
        });

        closeQuickView();

        switch (syncResult.status) {
          case 'canceled':
            NotificationHelper.success('cancelOrder', order.id);
            break;

          case 'completed':
            NotificationHelper.success('completeOrder', order.id);
            break;
          default:
        }

        this.removeEntity(order.id);

        return null;
      }

      const syncedOrder = new Order(this, syncResult);

      this.setItem(syncedOrder);
      this.selectEntity(syncedOrder, false);

      return syncedOrder;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('dispatchSync', typedError?.response?.code as ActionCode);

      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          ...order,
        },
        message: `Orders Sync With Dispatch Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    return null;
  }

  @actionAsync
  async completeOrder({
    shouldDeleteFromStore,
    completedOrder,
  }: {
    completedOrder: IConfigurableOrder;
    shouldDeleteFromStore: boolean;
  }) {
    const completedOrderData = mapCompletedOrder(completedOrder);

    try {
      this.clearPreconditionFailedError();
      await task(this.service.completeOrder(completedOrder.id, completedOrderData));

      if (shouldDeleteFromStore) {
        this.removeEntity(completedOrder.id);
      }

      this.requestCount({
        businessUnitId: completedOrder.businessUnit.id,
      });

      NotificationHelper.success('completeOrder', completedOrder.id);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.paymentError = typedError?.response?.code === OrderErrorCodes.PaymentRequired;
      this.validatePreconditionError(typedError);

      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        const updatedOrder = await task(this.service.getById(completedOrder.id));

        if (updatedOrder.status !== 'inProgress' && shouldDeleteFromStore) {
          this.removeEntity(completedOrder.id);
        }
      } else if (!this.paymentError) {
        NotificationHelper.error('completeOrder', typedError?.response?.code as ActionCode);
        Sentry.addBreadcrumb({
          category: 'Order',
          data: {
            ...completedOrder,
          },
          message: `Orders Complete Error ${JSON.stringify(typedError?.message)}`,
        });
        Sentry.captureException(typedError);
      }
    }
  }

  @actionAsync
  async edit(data: IConfigurableOrder) {
    const orderData = sanitizeEditOrder(data);

    // TODO: fix it later
    delete orderData.workOrder;

    this.loading = true;
    try {
      this.clearPreconditionFailedError();

      const response = await task(
        this.service.editOrder(orderData.id, orderData as unknown as IConfigurableOrder),
      );

      this.requestCount({ businessUnitId: data.businessUnit.id.toString() });

      NotificationHelper.success('editOrder', orderData.id);

      return response;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);

      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          ...orderData,
        },
        message: `Orders Edit Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);

      if (this.isPreconditionFailed) {
        await this.requestDetails({ orderId: data.id, edit: true });
        const prevStatus = data.status;

        const updatedOrder = this.selectedEntity;

        if (updatedOrder?.status !== prevStatus) {
          this.removeEntity(orderData.id);
          this.isOrderStatusChanged = true;
        }
      }
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async create(data: INewOrders) {
    const requestPayload = mapNewOrderRequest({
      ordersData: data,
      surcharges: this.globalStore.surchargeStore.values,
      region: this.globalStore.i18nStore.region,
      commercialTaxesUsed: data.commercialTaxesUsed,
    });
    const isMultiOrder =
      data.orders.length > 1 || data.orders.some(order => order.billableServiceQuantity > 1);

    try {
      this.loading = true;
      const response = await task(
        this.service.createOrder(requestPayload as unknown as Partial<IOrder>),
      );

      this.requestCount({ businessUnitId: data.businessUnitId });

      if (isMultiOrder) {
        NotificationHelper.success('create', 'Orders');
      } else {
        NotificationHelper.success('create', `Order #${response?.id ?? ''}`);
      }

      return response;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.paymentError = typedError?.response?.code === OrderErrorCodes.PaymentRequired;
      if (
        typedError.response?.details?.[0]?.message ===
        '"payment.deferredUntil" must be greater than "now"'
      ) {
        NotificationHelper.custom(
          'error',
          'Deferred day should be at least 1 day later than today',
        );
      } else if (
        typedError.response?.message ===
        'Service date must be later deferredUntil date at least in 1 day'
      ) {
        NotificationHelper.custom(
          'error',
          'Service date should be at least 1 day later than deferred day',
        );
      } else if (!this.paymentError) {
        NotificationHelper.error('createOrder', typedError?.response?.code as ActionCode);
        Sentry.addBreadcrumb({
          category: 'Order',
          data: {
            ...data,
          },
          message: `Orders Create Error ${JSON.stringify(typedError?.message)}`,
        });
        Sentry.captureException(typedError);
      }
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async requestOpenOrders(
    customerId: number,
    jobSiteId: number,
    projectId?: number,
    fetchAdditionalRecyclingData?: InitQueryFuncType,
  ) {
    if (this.loading) {
      return;
    }
    this.loading = true;

    try {
      const response = await task(
        this.service.requestOpenOrders(customerId, {
          limit: this.limit,
          skip: this.offset,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          jobSiteId,
          projectId,
        }),
      );

      this.validateLoading(response, this.limit);

      const orders = response.map(order => new Order(this, order));

      this.setItems(orders);

      if (fetchAdditionalRecyclingData) {
        const orderIds = response.map(order => order.id);

        await task(fetchAdditionalRecyclingData(orderIds));
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          customerId,
          jobSiteId,
          projectId,
        },
        message: `Orders Request Open Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async requestInvoicedOrders(
    customerId: number,
    jobSiteId: number,
    projectId?: number,
    fetchAdditionalRecyclingData?: InitQueryFuncType,
  ) {
    if (this.loading) {
      return;
    }
    this.loading = true;

    try {
      const response = await task(
        this.service.requestInvoicedOrders(customerId, {
          limit: this.limit,
          skip: this.offset,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          jobSiteId,
          projectId,
        }),
      );

      this.validateLoading(response, this.limit);

      const orders = response.map(order => new Order(this, order));

      this.setItems(orders);

      if (fetchAdditionalRecyclingData) {
        const orderIds = response.map(order => order.id);

        await task(fetchAdditionalRecyclingData(orderIds, 'INVOICED'));
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          customerId,
          jobSiteId,
          projectId,
        },
        message: `Orders Request Invoiced Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async requestGeneratedOrders(recurrentOrderId: number) {
    if (this.loading) {
      return;
    }
    this.loading = true;

    try {
      const response = await task(
        this.service.requestGeneratedOrders(recurrentOrderId, {
          limit: this.limit,
          skip: this.offset,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
        }),
      );

      this.validateLoading(response, this.limit);

      const orders = response.map(order => new Order(this, order));

      this.setItems(orders);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          recurrentOrderId,
        },
        message: `Orders Request Generated Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @action
  cleanup() {
    super.cleanup();
    this.detailsOpen = false;
    this.editOpen = false;
    this.detailsLoading = false;
    this.processedIndex = -1;
    this.paymentError = false;
    this.clearPreconditionFailedError();
  }

  @action
  cleanPaymentError() {
    this.paymentError = false;
  }

  @action
  cleanRatesError() {
    this.ratesError = false;
  }

  @actionAsync
  async validateAndApproveMultiple(orderIds: number[] | null, options: RequestOptions) {
    try {
      const { total } = await task(
        this.service.validateOrdersToApprove(
          {
            ids: orderIds,
          },
          options.businessUnitId,
        ),
      );

      if (total > 0) {
        return total;
      } else {
        await task(
          this.approveMultiple(
            { ids: orderIds, validOnly: true, businessUnitId: options.businessUnitId },
            options,
          ),
        );
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          orderIds,
          ...options,
        },
        message: `Orders Validate and Approve Multiply Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }

    return 0;
  }

  @actionAsync
  async validateAndFinalizeMultiple(orderIds: number[] | null, options: RequestOptions) {
    try {
      const { total } = await task(
        this.service.validateOrdersToFinalize(
          {
            ids: orderIds,
          },
          options.businessUnitId,
        ),
      );

      if (total > 0) {
        return total;
      } else {
        await task(
          this.finalizeMultiple(
            { ids: orderIds, validOnly: true, businessUnitId: options.businessUnitId },
            options,
          ),
        );
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          orderIds,
          ...options,
        },
        message: `Orders Validate and Finalize Multiply Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }

    return 0;
  }

  @actionAsync
  async approveMultiple(request: IApproveOrFinalizeMultipleRequest, options: RequestOptions) {
    try {
      await task(this.service.approveMultipleOrders(request));
      this.cleanup();
      NotificationHelper.success('approveMultipleOrders');
      await task(Promise.all([this.requestCount(options), this.request(options)]));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('approveMultipleOrders', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          request,
          ...options,
        },
        message: `Orders Approve Multiply Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async finalizeMultiple(request: IApproveOrFinalizeMultipleRequest, options: RequestOptions) {
    try {
      await task(this.service.finalizeMultipleOrders(request));
      this.cleanup();
      NotificationHelper.success('finalizeMultipleOrders');
      await task(Promise.all([this.requestCount(options), this.request(options)]));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('finalizeMultipleOrders', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          request,
          ...options,
        },
        message: `Orders Finalize Multiply Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async unapproveMultiple(orderIds: number[], options: RequestOptions) {
    try {
      await task(this.service.unapproveMultipleOrders(orderIds, options.businessUnitId));
      this.cleanup();
      NotificationHelper.success('unapproveMultipleOrders');
      await task(Promise.all([this.requestCount(options), this.request(options)]));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('unapproveMultipleOrders', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          orderIds,
          ...options,
        },
        message: `Orders Unapprove Multiply Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestById(id: number, quickView = false, edit = false) {
    try {
      const orderResponse = await task(this.service.getById(id, { quickView, edit }));
      const order = new Order(this, orderResponse);

      this.setItem(order);
      this.selectEntity(order);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          id,
          quickView,
          edit,
        },
        message: `Orders Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async refundWrongCreditCard(
    id: number,
    data: NewPayment & { businessUnitId: string; refundedPaymentId: number },
  ) {
    try {
      await task(this.service.refundWrongCC(id, data));

      NotificationHelper.success('refundWrongCreditCard');
    } catch (error: unknown) {
      const castedError = error as ApiError;

      if (castedError.statusCode === 412) {
        NotificationHelper.error('refundPrepaidOrder', ActionCode.PRECONDITION_FAILED);
      } else {
        NotificationHelper.error('refundWrongCreditCard');
        Sentry.addBreadcrumb({
          category: 'Order',
          data: {
            id,
            ...data,
          },
          message: `Orders Refund Wrong Credit Card Error ${JSON.stringify(castedError?.message)}`,
        });
        Sentry.captureException(castedError);
      }
    }
  }

  @action
  async getOrderHistory(orderId: number): Promise<DeepMap<ConvertDateFields<OrderHistory | null>>> {
    try {
      const historyData = await this.service.history(orderId);

      return historyData;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Order',
        data: {
          orderId,
        },
        message: `Orders Get History Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);

      return null;
    }
  }

  @action
  setAdditionalRecyclingValues(recyclingValues: AdditionalOrderData[]) {
    recyclingValues.forEach(({ haulingOrderId, ...values }) => {
      const order = this.getById(haulingOrderId);

      if (!order) {
        return;
      }

      order.setAdditionalRecyclingValues(values);
    });
  }
}
