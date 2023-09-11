import * as Sentry from '@sentry/react';
import { observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { DraftSubscriptionService, SubscriptionRequest, SubscriptionService } from '@root/api';
import { RequestQueryParams } from '@root/api/base';
import { Paths, SubscriptionTabRoutes } from '@root/consts';
import { NotificationHelper, pathToUrl } from '@root/helpers';
import { INewSubscription } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { IConfigurableSubscriptionDraft, IStoreCount, ISubscriptionDraft } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { BaseStore } from '../base/BaseStore';
import { convertCalculationDates, createCalculatePricesConfig } from '../subscription/helpers';
import { sanitizeSubscription } from '../subscription/sanitize';
import {
  GetCountOptions,
  RequestOptions,
  SubscriptionsAvailableFilters,
} from '../subscription/types';

import { ConvertDateFields, DeepMap } from '../../types/helpers/JsonConversions';
import { sanitizeConfigurableSubscriptionDraft } from './sanitize';
import { SubscriptionDraft } from './SubscriptionDraft';
import { SubscriptionDraftSortType } from './types';

export class SubscriptionDraftStore extends BaseStore<
  SubscriptionDraft,
  SubscriptionDraftSortType
> {
  private readonly service: DraftSubscriptionService = new DraftSubscriptionService();

  private readonly subscriptionService: SubscriptionService = new SubscriptionService();

  @observable allCounts: IStoreCount | undefined;

  @observable myCounts: IStoreCount | undefined;

  @observable customerCount = 0;

  @observable search = '';

  @observable detailsOpen = false;

  @observable editOpen = false;

  @observable subscriptionsFilters: SubscriptionsAvailableFilters = {
    businessLine: [],
    billingCycle: [],
    serviceFrequency: [],
  };

  getCounts(mine: boolean) {
    return mine ? this.myCounts : this.allCounts;
  }

  @actionAsync
  async requestSearch(search: string, options: RequestOptions) {
    this.search = search;
    this.cleanup();
    if (!search) {
      this.request(options);

      return;
    }

    try {
      const subscriptionsResponse = (await task(
        this.subscriptionService.searchBy(search, options),
      )) as DeepMap<ConvertDateFields<ISubscriptionDraft>>[];

      this.setItems(
        subscriptionsResponse.map(
          draft => new SubscriptionDraft(this as SubscriptionDraftStore, draft),
        ),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'SubscriptionDraft',
        message: `Subscription Drafts Request Search Error ${JSON.stringify(typedError?.message)}`,
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

    this.loading = true;
    try {
      const response = await task(
        this.service.create(requestPayload as Partial<SubscriptionRequest>),
      );

      NotificationHelper.success('create', 'Draft Subscription');

      this.loading = false;

      return response;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'create',
        typedError?.response?.code as ActionCode,
        'Draft Subscription',
      );
      Sentry.addBreadcrumb({
        category: 'SubscriptionDraft',
        message: `Subscription Drafts Create Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...data,
        },
      });
      Sentry.captureException(typedError);
    }
    this.loading = false;
  }

  @actionAsync
  async update(data: IConfigurableSubscriptionDraft) {
    const requestPayload = sanitizeConfigurableSubscriptionDraft(data, this.globalStore.i18nStore);

    try {
      this.clearPreconditionFailedError();
      this.loading = true;
      const response = await task(
        this.service.update(data.id, requestPayload as Partial<SubscriptionRequest>),
      );

      NotificationHelper.success('update', 'Draft Subscription');

      this.loading = false;

      return response;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Draft Subscription',
      );
      Sentry.addBreadcrumb({
        category: 'SubscriptionDraft',
        message: `Subscription Drafts Update Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...data,
        },
      });
      Sentry.captureException(typedError);

      if (this.isPreconditionFailed) {
        this.requestById(data.id);
      }
    }

    this.loading = false;
  }

  @actionAsync
  async request({ businessUnitId, customerId, mine, filterData = {} }: RequestOptions) {
    this.loading = true;

    if (this.search) {
      this.search = '';
    }

    let response = [];

    const options = {
      limit: this.limit,
      skip: this.offset,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      mine,
      businessUnitId,
      customerId,
      ...filterData,
    };

    try {
      response = await task(this.service.get(options));
      this.validateLoading(response, this.limit);

      this.setItems(response.map(draft => new SubscriptionDraft(this, draft)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'SubscriptionDraft',
        message: `Subscription Drafts Request Error ${JSON.stringify(typedError?.message)}`,
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
      const [draftsCountResponse, myDraftsCountResponse] = await task(
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

      this.allCounts = draftsCountResponse;
      this.myCounts = myDraftsCountResponse;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'SubscriptionDraft',
        message: `Subscription Drafts Count Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          businessUnitId,
          customerId,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestCustomerCount({ businessUnitId, customerId }: GetCountOptions) {
    try {
      const response = await task(
        this.service.getCount({
          businessUnitId,
          customerId,
        }),
      );

      this.customerCount = response.total;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'SubscriptionDraft',
        message: `Subscription Drafts Customer Count Request Error ${JSON.stringify(
          typedError.message,
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
  async getAllCustomerSubscriptions({ businessUnitId, customerId, mine }: RequestOptions) {
    if (this.loading) {
      return;
    }

    this.loading = true;

    if (this.search) {
      this.search = '';
    }

    const options = {
      limit: this.limit,
      skip: this.offset,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      mine,
      businessUnitId,
      customerId,
    };

    try {
      const response = await task(this.service.get(options));

      this.validateLoading(response, this.limit);

      this.setItems(response.map(draft => new SubscriptionDraft(this, draft)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'SubscriptionDraft',
        message: `Subscription Drafts Get All Customer Error ${JSON.stringify(
          typedError?.message,
        )}`,
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
    this.loading = true;

    try {
      const response = await task(this.service.getAvailableFilters(businessUnitId));

      this.subscriptionsFilters = response;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'SubscriptionDraft',
        message: `Subscription Drafts Filters Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          businessUnitId,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async requestById(id: number, { includeProration, ...options }: RequestQueryParams = {}) {
    if (this.loading) {
      return;
    }

    this.loading = true;
    try {
      const response = await task(this.service.getById(id, options));

      const entity = new SubscriptionDraft(this, response);

      if (includeProration) {
        // TODO: move implementation of this param to backend
        const prorationResponse = await task(
          this.subscriptionService.calculatePrices(createCalculatePricesConfig(entity)),
        );

        entity.proration = convertCalculationDates(prorationResponse).subscriptionPriceCalculation;
      }

      this.setItem(entity);
      this.updateSelectedEntity(entity);

      return entity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'SubscriptionDraft',
        message: `Subscription Drafts Request By Id Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...options,
        },
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async delete(id: number) {
    try {
      await task(this.service.delete(id));

      this.removeEntity(id);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'SubscriptionDraft',
        message: `Subscription Drafts Delete Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async updateStatusToActive(idActive: number, data: INewSubscription) {
    const requestPayload: unknown = sanitizeSubscription(data, this.globalStore.i18nStore);

    try {
      this.loading = true;
      const response = await task(
        this.service.updateToActive(
          idActive,
          requestPayload as Partial<SubscriptionRequest> | null,
        ),
      );

      NotificationHelper.success('create', `Subscription #${response.id}`);

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
      this.globalStore.subscriptionStore.validatePaymentError(typedError);

      if (!this.globalStore.subscriptionStore.paymentError) {
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
}
