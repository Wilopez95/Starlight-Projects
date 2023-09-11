import * as Sentry from '@sentry/react';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { SubscriptionOrderService } from '@root/api';
import { RequestQueryParams } from '@root/api/base';
import { ApiError } from '@root/api/base/ApiError';
import { ICancelOrderData } from '@root/components/forms/CancelOrder/types';
import { IRevertStatusForm } from '@root/components/forms/RevertOrderStatus/types';
import { OrderErrorCodes } from '@root/consts/orderErrorCodes';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { INewSubscriptionOrders } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import {
  IConfigurableSubscriptionOrder,
  ISubscriptionOrderCalculatePricePayload,
  ISubscriptionOrderCalculatePriceResponse,
} from '@root/types';
import {
  IApproveOrFinalizeMultipleSubscriptionOrdersRequest,
  IValidateMultipleSubscriptionOrdersRequest,
  SubscriptionOrderStatusEnum,
} from '@root/types/entities/subscriptionOrder/subscriptionOrder';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import {
  mapNewSubscriptionOrderRequest,
  mapUncompleteData,
  sanitizeSubscriptionOrder,
} from './sanitize';
import { SubscriptionOrder } from './SubscriptionOrder';
import {
  HandleTransitionStatusError,
  ISubscriptionOrderCounts,
  RefreshData,
  RequestOptions,
  RequestOptionsBySubscriptionId,
  RevertStatusRequest,
  SubscriptionOrdersStoreSortType,
  UpdateStatusRequest,
} from './types';

export class SubscriptionOrderStore extends BaseStore<
  SubscriptionOrder,
  SubscriptionOrdersStoreSortType
> {
  private readonly service: SubscriptionOrderService = new SubscriptionOrderService();

  @observable editOpen = false;
  @observable isNonServiceEditOpen = false;
  @observable paymentError = false;
  @observable allCounts?: ISubscriptionOrderCounts;
  @observable ratesError = false;
  @observable detailsOpen = false;
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(global: GlobalStore) {
    super(global);
  }

  @computed
  get quickViewCondition() {
    return !this.editOpen && this.isOpenQuickView;
  }

  @computed
  get checkedSubscriptionOrders() {
    return this.values.filter(subscriptionOrder => subscriptionOrder.checked);
  }

  @computed
  get checkedNeedsApprovalSubscriptionOrders() {
    return this.values.filter(
      subscriptionOrder =>
        subscriptionOrder.checked &&
        subscriptionOrder.status === SubscriptionOrderStatusEnum.needsApproval,
    );
  }

  @action
  checkAll(value: boolean) {
    this.values.forEach(subscriptionOrder => (subscriptionOrder.checked = value));
  }

  @action
  checkNeedsApproval(value: boolean) {
    this.values
      .filter(item => item.status === SubscriptionOrderStatusEnum.needsApproval)
      .forEach(subscriptionOrder => (subscriptionOrder.checked = value));
  }

  @action
  cleanRatesError() {
    this.ratesError = false;
  }

  @computed
  get isAllChecked() {
    const subscriptionOrders = this.values;

    const loading = this.loading;

    return (
      this.checkedSubscriptionOrders.length === subscriptionOrders.length &&
      subscriptionOrders.length > 0 &&
      !loading
    );
  }

  @computed
  get isAllNeedsApprovalChecked() {
    const loading = this.loading;

    const needsApprovalSubscriptionOrders = this.values.filter(
      subscriptionOrder => subscriptionOrder.status === SubscriptionOrderStatusEnum.needsApproval,
    );

    if (needsApprovalSubscriptionOrders.length) {
      return (
        this.checkedNeedsApprovalSubscriptionOrders.length ===
          needsApprovalSubscriptionOrders.length &&
        needsApprovalSubscriptionOrders.length > 0 &&
        !loading
      );
    }
  }

  getCounts() {
    return this.allCounts;
  }

  getChecketCounts() {
    return this.checkedSubscriptionOrders.length;
  }

  getCountByStatus(status: SubscriptionOrderStatusEnum) {
    const counts = this.getCounts();

    if (!counts) {
      return 0;
    }

    if (counts.statuses) {
      switch (status) {
        case SubscriptionOrderStatusEnum.completed:
          return (
            counts.statuses[SubscriptionOrderStatusEnum.completed] +
            counts.statuses[SubscriptionOrderStatusEnum.needsApproval]
          );
        case SubscriptionOrderStatusEnum.finalized:
          return (
            counts.statuses[SubscriptionOrderStatusEnum.finalized] +
            counts.statuses[SubscriptionOrderStatusEnum.canceled]
          );
        default:
          return counts.statuses[status];
      }
    } else {
      return 0;
    }
  }

  @actionAsync
  async request({ filterData, search }: RequestOptions) {
    if (this.loading) {
      return; // quick fix for TableInfiniteScroll request duplication
    }

    this.loading = true;

    try {
      const response = await task(
        this.service.get({
          limit: this.limit,
          skip: this.offset,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          query: search,
          ...filterData,
        }),
      );

      this.validateLoading(response, this.limit);

      const result = response.map(
        subscriptionOrder => new SubscriptionOrder(this, subscriptionOrder),
      );

      this.setItems(result);

      return result;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      Sentry.addBreadcrumb({
        category: 'SubscriptionOrder',
        message: `Subscription Orders Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          filterData,
          search,
        },
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
      this.offset += this.limit;
    }
  }

  @actionAsync
  async requestBySubscriptionId({
    subscriptionId,
    filterData = {},
    ...options
  }: RequestOptionsBySubscriptionId) {
    if (this.loading) {
      return;
    }

    this.loading = true;

    try {
      const response = await task(
        this.service.getBySubscriptionId(subscriptionId, {
          limit: this.limit,
          skip: this.offset,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          ...options,
          ...filterData,
        }),
      );

      this.validateLoading(response, this.limit);

      const result = response.map(
        subscriptionOrder => new SubscriptionOrder(this, subscriptionOrder),
      );

      this.setItems(result);

      return result;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'SubscriptionOrder',
        message: `Subscription Orders Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          subscriptionId,
          filterData,
          ...options,
        },
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
      this.offset += this.limit;
    }
  }

  @action
  openEdit(order: SubscriptionOrder) {
    this.editOpen = true;
    this.selectEntity(order, false);
  }

  @action
  openNonServiceEdit(order: SubscriptionOrder) {
    this.isNonServiceEditOpen = true;
    this.selectEntity(order, false);
  }

  @action.bound
  closeEdit() {
    this.editOpen = false;
    this.toggleQuickView(false);
  }

  @action.bound
  closeNonServiceEdit() {
    this.isNonServiceEditOpen = false;
    this.toggleQuickView(false);
  }

  @action.bound
  openDetails() {
    this.detailsOpen = true;
    this.toggleQuickView(false);
  }

  @actionAsync
  async openCompletionDetails(subscriptionOrderId: number, completed: boolean) {
    await this.requestById(subscriptionOrderId, { completed, isCompletion: true });
    this.openDetails();
  }

  @action.bound
  closeDetails() {
    this.detailsOpen = false;
  }

  @actionAsync
  async requestById(id: number, options: RequestQueryParams = {}) {
    if (this.loading) {
      return;
    }

    this.loading = true;
    try {
      const response = await task(this.service.getById(id, options));
      const entity = new SubscriptionOrder(this, response);

      this.setItem(entity);
      this.selectEntity(entity);

      return entity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'SubscriptionOrder',
        message: `Subscription Orders Request by ID Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
          options,
        },
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async cancel(
    { id, businessUnitId, refreshCount }: RefreshData,
    data: ICancelOrderData,
    sequenceId: string,
  ) {
    try {
      await task(this.service.cancel(id, data));

      await this.refreshData({
        id,
        refreshCount,
        businessUnitId,
      });
      this.unSelectEntity();
      NotificationHelper.success('cancelOrder', sequenceId);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      if (typedError?.response?.code === OrderErrorCodes.RatesNotFound) {
        this.ratesError = true;
      } else {
        NotificationHelper.error('cancelOrder', typedError?.response?.code as ActionCode, id);
      }
      Sentry.addBreadcrumb({
        category: 'SubscriptionOrder',
        message: `Subscription Orders Cancel Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
          data,
          businessUnitId,
          refreshCount,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @action
  validatePaymentError(error: ApiError) {
    this.paymentError = error?.response?.code === OrderErrorCodes.PaymentRequired;
  }

  @action
  cleanPaymentError() {
    this.paymentError = false;
  }

  @actionAsync
  async complete({
    id,
    subscriptionOrder,
    businessUnitId,
    refreshCount,
    sequenceId,
  }: UpdateStatusRequest) {
    try {
      this.clearPreconditionFailedError();
      await task(this.service.complete(id, subscriptionOrder));
      await this.refreshData({
        id,
        refreshCount,
        businessUnitId,
      });

      NotificationHelper.success('completeOrder', sequenceId);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      await this.handleTransitionStatusError({
        id,
        error: typedError,
        status: SubscriptionOrderStatusEnum.inProgress,
      });

      if (!this.paymentError) {
        NotificationHelper.error('completeOrder', typedError?.response?.code as ActionCode);
        Sentry.addBreadcrumb({
          category: 'SubscriptionOrder',
          message: `Subscription Orders Complete Error ${JSON.stringify(typedError?.message)}`,
          data: {
            id,
            subscriptionOrder,
            businessUnitId,
            refreshCount,
            sequenceId,
          },
        });
        Sentry.captureException(typedError);
      }
      NotificationHelper.error('completeOrder', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'SubscriptionOrder',
        message: `Subscription Orders Complete Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
          subscriptionOrder,
          businessUnitId,
          refreshCount,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async uncomplete({
    id,
    data,
    businessUnitId,
    refreshCount,
    sequenceId,
  }: RevertStatusRequest<IRevertStatusForm>) {
    const sanitizedData = mapUncompleteData(data);

    try {
      await task(this.service.uncomplete(id, sanitizedData));
      await this.refreshData({
        id,
        refreshCount,
        businessUnitId,
      });

      NotificationHelper.success('uncompleteOrder', sequenceId);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('uncompleteOrder', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'SubscriptionOrder',
        message: `Subscription Orders Uncomplete Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
          data,
          businessUnitId,
          refreshCount,
          sequenceId,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async approve({
    id,
    subscriptionOrder,
    businessUnitId,
    refreshCount,
    sequenceId,
  }: UpdateStatusRequest) {
    try {
      this.clearPreconditionFailedError();
      await task(this.service.approve(id, subscriptionOrder));
      await this.refreshData({
        id,
        refreshCount,
        businessUnitId,
      });

      NotificationHelper.success('approveOrder', sequenceId);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      await this.handleTransitionStatusError({
        id,
        error: typedError,
        status: SubscriptionOrderStatusEnum.completed,
      });

      if (!this.paymentError) {
        NotificationHelper.error('approveOrder', typedError?.response?.code as ActionCode);
        Sentry.addBreadcrumb({
          category: 'SubscriptionOrder',
          message: `Subscription Order Approve Payment Error ${JSON.stringify(
            typedError?.message,
          )}`,
          data: {
            id,
            subscriptionOrder,
            businessUnitId,
            refreshCount,
          },
        });
        Sentry.captureException(typedError);
      }
      NotificationHelper.error('approveOrder', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'SubscriptionOrder',
        message: `Subscription Orders Approve Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
          subscriptionOrder,
          businessUnitId,
          refreshCount,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async unapprove({ id, data, businessUnitId, refreshCount, sequenceId }: RevertStatusRequest) {
    try {
      await task(this.service.unapprove(id, data));
      await this.refreshData({
        id,
        refreshCount,
        businessUnitId,
      });

      NotificationHelper.success('unapproveOrder', sequenceId);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('unapproveOrder', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'SubscriptionOrder',
        message: `Subscription Orders Unapprove Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
          data,
          businessUnitId,
          refreshCount,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async finalize({
    id,
    subscriptionOrder,
    businessUnitId,
    refreshCount,
    sequenceId,
  }: UpdateStatusRequest) {
    try {
      this.clearPreconditionFailedError();
      await task(this.service.finalize(id, subscriptionOrder));
      await this.refreshData({
        id,
        refreshCount,
        businessUnitId,
      });

      NotificationHelper.success('finalizeOrder', sequenceId);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      await this.handleTransitionStatusError({
        id,
        error: typedError,
        status: SubscriptionOrderStatusEnum.approved,
      });

      if (!this.paymentError) {
        NotificationHelper.error('finalizeOrder', typedError?.response?.code as ActionCode);
        Sentry.addBreadcrumb({
          category: 'SubscriptionOrder',
          message: `Subscription Orders Finalize Error ${JSON.stringify(typedError?.message)}`,
          data: {
            id,
            subscriptionOrder,
            businessUnitId,
            refreshCount,
          },
        });
        Sentry.captureException(typedError);
      }
    }
  }

  @actionAsync
  async unfinalize({ id, data, businessUnitId, refreshCount, sequenceId }: RevertStatusRequest) {
    try {
      await task(this.service.unfinalize(id, data));
      await this.refreshData({
        id,
        refreshCount,
        businessUnitId,
      });

      NotificationHelper.success('unfinalizeOrder', sequenceId);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('unfinalizeOrder', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'SubscriptionOrder',
        message: `Subscription Orders Unfinalize Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
          data,
          businessUnitId,
          refreshCount,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async refreshData({ id, businessUnitId, refreshCount }: RefreshData) {
    if (refreshCount) {
      this.removeEntity(id);
      this.requestCount(businessUnitId);
    } else {
      const updatedSubscriptionOrder = await task(this.service.getById(id));
      const entity = new SubscriptionOrder(this, updatedSubscriptionOrder);

      this.setItem(entity);
    }
  }

  @actionAsync
  async handleTransitionStatusError({ id, error, status }: HandleTransitionStatusError) {
    this.validatePaymentError(error);
    this.validatePreconditionError(error);

    if (this.isPreconditionFailed) {
      NotificationHelper.error('default', error?.response?.code as ActionCode);
      const updatedSubscriptionOrder = await task(this.service.getById(id));

      if (updatedSubscriptionOrder.status !== status) {
        this.removeEntity(id);
      }
    }
  }

  @actionAsync
  async create(data: INewSubscriptionOrders) {
    const [requestPayload, subscriptionId] = mapNewSubscriptionOrderRequest(
      data,
      this.globalStore.i18nStore.region,
    );

    try {
      this.loading = true;

      const response = await task(
        this.service.create(requestPayload as IConfigurableSubscriptionOrder, subscriptionId),
      );

      NotificationHelper.success('create', 'Subscription Order');

      return response;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePaymentError(typedError);

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
        NotificationHelper.error(
          'create',
          typedError?.response?.code as ActionCode,
          'Subscription Order',
        );
        Sentry.addBreadcrumb({
          category: 'SubscriptionOrder',
          message: `Subscription Orders Create Error ${JSON.stringify(typedError?.message)}`,
          data: {
            ...data,
          },
        });
        Sentry.captureException(typedError);
      }
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async update(data: IConfigurableSubscriptionOrder) {
    try {
      this.loading = true;
      this.cleanPaymentError();
      const requestPayload = sanitizeSubscriptionOrder(data);

      await task(this.service.update(requestPayload));

      NotificationHelper.success('default');

      const updatedSubscriptionOrder = await task(this.service.getById(data.id));
      const entity = new SubscriptionOrder(this, updatedSubscriptionOrder);

      this.setItem(entity);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
      this.validatePaymentError(typedError);

      if (!this.paymentError) {
        NotificationHelper.error('default');
      }
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async requestCount(businessUnitId: string) {
    try {
      const data = await task(this.service.getCount({ businessUnitId }));

      this.allCounts = data;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'SubscriptionOrder',
        message: `Subscription Orders Request Count Error ${JSON.stringify(typedError?.message)}`,
        data: {
          businessUnitId,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async calculatePrices(
    payload: ISubscriptionOrderCalculatePricePayload,
    abortSignal?: AbortSignal,
  ): Promise<ISubscriptionOrderCalculatePriceResponse | null> {
    try {
      return await task(this.service.calculatePrices(payload, abortSignal));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'SubscriptionOrder',
        message: `Subscription Orders Calculate Price Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...payload,
          abortSignal,
        },
      });
      Sentry.captureException(typedError);
    }

    return null;
  }

  @actionAsync
  async validateMultipleToApproveOrFinalize({
    ids,
    options,
    businessUnitId,
    status,
  }: IValidateMultipleSubscriptionOrdersRequest) {
    try {
      const { invalidOrdersTotal } = await task(
        this.service.validateSubscriptionOrdersToApproveOrFinalize({
          ids,
          options,
          businessUnitId,
          status,
        }),
      );

      if (invalidOrdersTotal > 0) {
        return invalidOrdersTotal;
      } else {
        const nextStatus =
          status === SubscriptionOrderStatusEnum.needsApproval
            ? SubscriptionOrderStatusEnum.approved
            : SubscriptionOrderStatusEnum.finalized;

        await task(
          this.approveOrFinalizeMultiple(
            {
              ids,
              businessUnitId,
              validOnly: true,
              status: nextStatus,
            },
            options,
          ),
        );
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'SubscriptionOrder',
        data: {
          ids,
          ...options,
          businessUnitId,
          status,
        },
        message: `Subscription Orders Validate and Approve/Finalize Multiply Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }

    return 0;
  }

  @actionAsync
  async approveOrFinalizeMultiple(
    request: IApproveOrFinalizeMultipleSubscriptionOrdersRequest,
    options: RequestOptions,
  ) {
    const { status } = request;
    const message =
      status === SubscriptionOrderStatusEnum.approved
        ? 'approveMultipleSubscriptionOrders'
        : 'finalizeMultipleSubscriptionOrders';

    try {
      await task(this.service.approveOrFinalizeMultipleSubscriptionOrders(request));
      this.cleanup();
      NotificationHelper.success(message);
      await task(
        Promise.all([this.requestCount(request.businessUnitId.toString()), this.request(options)]),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(message, typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Subscription',
        data: {
          request,
          ...options,
          status,
        },
        message: `Subscription Orders Approve/Finalize Multiply Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }
  }
}
