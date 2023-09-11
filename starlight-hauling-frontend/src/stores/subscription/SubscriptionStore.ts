/* eslint-disable @typescript-eslint/no-useless-constructor */
import * as Sentry from '@sentry/react';
import { action, computed, observable } from 'mobx';
import { actionAsync, createTransformer, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import { ApiError } from '@root/api/base/ApiError';
import { SubscriptionService } from '@root/api/subscription/subscription';
import { Paths, SubscriptionTabRoutes } from '@root/consts';
import { OrderErrorCodes } from '@root/consts/orderErrorCodes';
import { NotificationHelper, pathToUrl } from '@root/helpers';
import {
  INewSubscription,
  ISubscriptionServiceItems,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import {
  IConfigurableSubscription,
  IReviewProration,
  ISubscription,
  ISubscriptionHistoryRecord,
  ISubscriptionOnHoldDetails,
  SubscriptionStatusEnum,
} from '@root/types';

import { isEmpty } from 'lodash-es';
import { ActionCode } from '@root/helpers/notifications/types';
import { SubscriptionRequest } from '@root/api';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { ConvertDateFields, DeepMap } from '../../types/helpers/JsonConversions';
import {
  convertCalculationDates,
  convertSubscriptionHistoryRecordDates,
  convertSubscriptionStoreCounts,
  createCalculatePricesConfig,
} from './helpers';
import { sanitizeConfigurableSubscription, sanitizeSubscription } from './sanitize';
import { Subscription } from './Subscription';
import {
  GetCountOptions,
  RequestOptions,
  SubscriptionDraftSortType,
  SubscriptionsAvailableFilters,
  SubscriptionStoreCount,
} from './types';

export class SubscriptionStore extends BaseStore<Subscription, SubscriptionDraftSortType> {
  private readonly service: SubscriptionService = new SubscriptionService();

  @observable allCounts?: SubscriptionStoreCount;

  @observable myCounts?: SubscriptionStoreCount;

  @observable allCustomerCounts?: SubscriptionStoreCount;

  @observable allCountsConfig?: SubscriptionStoreCount;

  @observable search = '';

  @observable detailsOpen = false;

  @observable editOpen = false;

  @observable services: ISubscriptionServiceItems[] = [];

  @observable subscriptionsFilters: SubscriptionsAvailableFilters = {
    businessLine: [],
    billingCycle: [],
    serviceFrequency: [],
  };

  @observable history: ISubscriptionHistoryRecord[] = [];

  @observable paymentError = false;

  @observable status: SubscriptionStatusEnum | undefined;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  // eslint-disable-next-line no-useless-constructor
  constructor(global: GlobalStore) {
    super(global);
  }

  @computed get customerCounts() {
    return this.allCustomerCounts;
  }

  @computed
  get quickViewCondition() {
    return this.isOpenQuickView && !this.editOpen;
  }

  getCounts(mine: boolean) {
    return mine ? this.myCounts : this.allCounts;
  }

  getCountByStatus(status: SubscriptionStatusEnum | undefined, mine: boolean) {
    const counts = this.getCounts(mine);

    if (!counts || !status) {
      return 0;
    }

    return counts[status];
  }

  @computed
  get getCustomerCountByStatus() {
    return createTransformer((status: SubscriptionStatusEnum) => {
      if (!this.customerCounts) {
        return 0;
      }

      return this.customerCounts[status];
    });
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
  async requestSearch(search: string, options: RequestOptions) {
    this.search = search;
    options.sortBy = this.sortBy;
    this.cleanup();
    if (!search) {
      this.request(options);

      return;
    }

    try {
      const subscriptionsResponse = (await task(this.service.searchBy(search, options))) as DeepMap<
        ConvertDateFields<ISubscription>
      >[];

      this.setItems(subscriptionsResponse.map(subs => new Subscription(this, subs)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Subscription',
        message: `Subscriptions Request Search Error ${JSON.stringify(typedError?.message)}`,
        data: {
          search,
          ...options,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.loaded = true;
  }

  @actionAsync
  async create(data: INewSubscription) {
    const requestPayload: unknown = sanitizeSubscription(data, this.globalStore.i18nStore);

    try {
      this.loading = true;
      const response = await task(
        this.service.create(requestPayload as Partial<SubscriptionRequest>),
      );

      NotificationHelper.success('create', `Subscription #${response.id}`);

      this.requestCount({
        businessUnitId: data?.businessUnitId,
        customerId: data?.customerId.toString(),
      });
      for (const id of response.oneTimeOrdersSequenceIds) {
        NotificationHelper.successWithLink(
          {
            uri: pathToUrl(Paths.CustomerSubscriptionModule.OrderDetails, {
              customerId: data.customerId,
              businessUnit: data.businessUnitId,
              tab: SubscriptionTabRoutes.Active,
              subscriptionId: response.id,
              subscriptionOrderId: id,
            }),

            label: ` #${id.toString()}`,
          },
          'subscriptionOrderCreated',
        );
      }

      return response;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePaymentError(typedError);

      if (!this.paymentError) {
        NotificationHelper.error(
          'create',
          typedError?.response?.code as ActionCode,
          'Subscription',
        );
        Sentry.addBreadcrumb({
          category: 'Subscription',
          message: `Subscriptions Create Error ${JSON.stringify(typedError?.message)}`,
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
  async update(configurableSubscription: IConfigurableSubscription) {
    const requestPayload = sanitizeConfigurableSubscription(
      configurableSubscription,
      this.globalStore.i18nStore,
    );

    try {
      this.clearPreconditionFailedError();
      this.loading = true;
      await task(
        this.service.update(
          configurableSubscription.id,
          requestPayload as Partial<SubscriptionRequest>,
        ),
      );

      NotificationHelper.success('update', 'Subscription');

      if (configurableSubscription.onHold) {
        NotificationHelper.success('subscriptionOnHold', configurableSubscription.id);
      }

      if (configurableSubscription.offHold) {
        NotificationHelper.success('subscriptionResume', configurableSubscription.id);
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
      this.validatePreconditionError(typedError);
      this.validatePaymentError(typedError);

      if (this.isPreconditionFailed) {
        this.requestById(configurableSubscription.id);
      }

      if (!this.paymentError) {
        NotificationHelper.error('update', typedError.response.code as ActionCode, 'Subscription');
      }
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async request({
    businessUnitId,
    customerId,
    businessLine,
    jobSiteId,
    serviceAreaId,
    status,
    mine,
    filterData = {},
  }: RequestOptions) {
    if (this.loading) {
      return;
    }
    this.status = status;
    this.loading = true;

    if (this.search) {
      this.search = '';
    }

    let response = [];

    const options = {
      mine,
      status,
      limit: this.limit,
      skip: this.offset,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      businessUnitId,
      customerId,
      businessLine,
      jobSiteId,
      serviceAreaId,
      ...filterData,
    };

    try {
      response = await task(this.service.requestGetPaginated(options));

      this.validateLoading(response, this.limit);

      const subscriptions = response.map(subs => new Subscription(this, subs));

      if (isEmpty(subscriptions) || subscriptions?.[0]?.status === this.status) {
        this.setItems(subscriptions);
      }
      await this.requestCount({ businessUnitId });
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Subscription',
        message: `Subscriptions Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...options,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async requestCount({ businessUnitId, customerId }: GetCountOptions) {
    try {
      const [countResponse, myCountResponse] = await task(
        Promise.all([
          this.service.getCount({
            businessUnitId,
            customerId,
          }),
          this.service.getCount({
            mine: true,
            businessUnitId,
            customerId,
          }),
        ]),
      );

      this.allCounts = convertSubscriptionStoreCounts(countResponse);
      this.myCounts = convertSubscriptionStoreCounts(myCountResponse);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Subscription',
        message: `Subscriptions Count Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          customerId,
          businessUnitId,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestCustomerCount({ businessUnitId, customerId }: GetCountOptions) {
    try {
      const countResponse = await task(
        this.service.getCount({
          businessUnitId,
          customerId,
        }),
      );

      this.allCustomerCounts = convertSubscriptionStoreCounts(countResponse);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Subscription',
        message: `Subscriptions Customer Count Request Error ${JSON.stringify(
          typedError?.message,
        )}`,
        data: {
          businessUnitId,
          customerId,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async getAllCustomerSubscriptions({ businessUnitId, customerId, status, mine }: RequestOptions) {
    if (this.loading) {
      return;
    }

    this.loading = true;

    if (this.search) {
      this.search = '';
    }

    const options = {
      mine,
      status,
      limit: this.limit,
      skip: this.offset,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      businessUnitId,
      customerId,
    };

    try {
      const response = await task(this.service.get(options));

      this.validateLoading(response, this.limit);

      const subscriptions = response.map(order => new Subscription(this, order));

      this.setItems(subscriptions);

      await this.requestCustomerCount({ businessUnitId, customerId: `${customerId}` });
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Subscription',
        message: `Subscriptions Get All Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...options,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async getAllAvailableFilters(businessUnitId: string) {
    try {
      const response = await task(this.service.getAvailableFilters(businessUnitId));

      this.subscriptionsFilters = response;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'Subscription',
        message: `Subscriptions Filters Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          businessUnitId,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestById(id: number, { includeProration, ...options }: RequestQueryParams = {}) {
    if (this.loading) {
      return;
    }

    this.loading = true;
    try {
      const response = await task(this.service.getById(id, options));

      const entity = new Subscription(this, response);

      if (includeProration) {
        // TODO: move implementation of this param to backend
        const prorationResponse = await task(
          this.service.calculatePrices(createCalculatePricesConfig(entity)),
        );

        entity.proration = convertCalculationDates(prorationResponse).subscriptionPriceCalculation;
      }

      this.setItem(entity);
      this.selectEntity(entity);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Subscription',
        message: `Subscriptions Request By Id Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
          ...options,
        },
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async requestSubscriptionServices(id: number) {
    this.loading = true;
    try {
      const response = await task(this.service.getSubscriptionServiceItems(id));

      this.services = response as ISubscriptionServiceItems[];
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Subscription',
        message: `Subscriptions Request Services Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async requestHistoryById(subscriptionId: number) {
    try {
      const response = await task(this.service.requestHistoryById(subscriptionId));

      this.history = response.map(convertSubscriptionHistoryRecordDates);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Subscription',
        message: `Subscriptions Request History Error ${JSON.stringify(typedError?.message)}`,
        data: {
          subscriptionId,
        },
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async putOnHold(id: number, requestPayload: ISubscriptionOnHoldDetails) {
    try {
      this.clearPreconditionFailedError();
      this.loading = true;
      await task(this.service.putOnHold(id, requestPayload));

      NotificationHelper.success('subscriptionOnHold', id);

      return true;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);

      if (this.isPreconditionFailed) {
        await this.requestById(id);
      }

      NotificationHelper.error('subscriptionOnHold', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Subscription',
        message: `Subscriptions Put On Hold Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
          ...requestPayload,
        },
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async resume(id: number) {
    try {
      this.loading = true;

      await task(this.service.resume(id));
      NotificationHelper.success('subscriptionResume', id);

      return true;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async reviewProration(subscriptionId: number, payload: IReviewProration) {
    try {
      await this.service.reviewProration(subscriptionId, payload);

      return true;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Subscription',
        message: `Subscriptions Review Proration Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...payload,
          subscriptionId,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @action
  cleanupHistory() {
    this.history = [];
  }

  @action
  cleanup() {
    super.cleanup();
    this.cleanupHistory();
  }
}
