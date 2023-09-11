import { action, computed, observable } from 'mobx';
import { actionAsync, createTransformer, task } from 'mobx-utils';

import GlobalStore from '@root/app/GlobalStore';
import { RequestQueryParams } from '@root/core/api/base/types';
import { NotificationHelper } from '@root/core/helpers';
import { BaseStore } from '@root/core/stores/base/BaseStore';
import { SortType, SubscriptionStatusEnum } from '@root/core/types';
import { ISubscriptionServiceItems } from '@root/customer/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { SubscriptionService } from '@root/orders-and-subscriptions/api/subscription/subscription';
import { SortKey } from '@root/orders-and-subscriptions/components/TableSortableHeader/types';

import { Subscription } from './Subscription';
import { GetCountOptions, RequestOptions, SubscriptionStoreCount } from './types';

export class SubscriptionStore extends BaseStore<Subscription> {
  private readonly service: SubscriptionService = new SubscriptionService();

  @observable allCounts?: SubscriptionStoreCount;
  @observable myCounts?: SubscriptionStoreCount;
  @observable allCustomerCounts?: SubscriptionStoreCount;
  @observable sortBy: SortKey = 'id';
  @observable sortOrder: SortType = 'desc';
  @observable search = '';
  @observable detailsOpen = false;
  @observable editOpen = false;
  @observable services: ISubscriptionServiceItems[] = [];

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
    return mine ? this.myCounts : this.allCustomerCounts;
  }

  getCountByStatus(status: SubscriptionStatusEnum, mine: boolean) {
    const counts = this.getCounts(mine);

    if (!counts) {
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

  @action.bound
  setSort(sortBy: SortKey, sortOrder: SortType) {
    this.sortOrder = sortOrder;
    this.sortBy = sortBy;
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
      const subscriptionsResponse = await task(this.service.searchBy(search, options));

      this.setItems(subscriptionsResponse.map((subs) => new Subscription(this, subs)));
    } catch (error) {
      console.error('Subscription Request Search Error:', error);
    }

    this.loading = false;
    this.loaded = true;
  }

  @actionAsync
  async request({
    customerId,
    businessLine,
    jobSiteId,
    serviceAreaId,
    status,
    mine,
  }: RequestOptions) {
    if (this.loading) {
      return;
    }
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
      customerId,
      businessLine,
      jobSiteId,
      serviceAreaId,
    };

    try {
      response = await task(this.service.get(options));

      this.validateLoading(response, this.limit);

      const subscriptions = response.map((subs) => new Subscription(this, subs));

      this.setItems(subscriptions);
    } catch (error) {
      console.error('Subscription Request Error', error);
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

      this.allCounts = {
        total: countResponse.total,
        ...countResponse.statuses,
      };
      this.myCounts = {
        total: myCountResponse.total,
        ...myCountResponse.statuses,
      };
    } catch (error) {
      console.error('Subscription RequestCount Error', error);
    }
  }

  @actionAsync
  async requestCustomerCount({ businessUnitId, customerId }: GetCountOptions) {
    try {
      const [countResponse] = await task(
        Promise.all([
          this.service.getCount({
            businessUnitId,
            customerId,
          }),
        ]),
      );

      this.allCustomerCounts = {
        total: countResponse.total,
        ...countResponse.statuses,
      };
    } catch (error) {
      console.error('Subscription RequestCount Error', error);
    }
  }

  @actionAsync
  async getAllCustomerSubscriptions({ customerId, status, mine }: RequestOptions) {
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
      customerId,
    };

    try {
      const response = await task(this.service.get(options));

      this.validateLoading(response, this.limit);

      const subscriptions = response.map((order) => new Subscription(this, order));

      this.setItems(subscriptions);
    } catch (error) {
      console.error('Subscription Request Error', error);
    }

    this.loading = false;

    this.offset += this.limit;
  }

  @actionAsync
  async requestById(id: number, options: RequestQueryParams) {
    this.loading = true;
    try {
      const response = await task(this.service.getById(id, options));

      const entity = new Subscription(this, response);

      this.setItem(entity);
      this.updateSelectedEntity(entity);
    } catch (error) {
      NotificationHelper.error('subscription');
    } finally {
      this.loading = false;
    }
    this.loading = false;
  }

  @actionAsync
  async requestSubscriptionServices(id: number) {
    this.loading = true;
    try {
      const response = await task(this.service.getSubscriptionServiceItems(id));

      this.services = response as ISubscriptionServiceItems[];
    } catch (error) {
      NotificationHelper.error('subscription');
    } finally {
      this.loading = false;
    }
  }
}
