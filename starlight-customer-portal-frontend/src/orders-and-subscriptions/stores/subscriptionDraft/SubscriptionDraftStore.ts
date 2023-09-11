import { action, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import GlobalStore from '@root/app/GlobalStore';
import { RequestQueryParams } from '@root/core/api/base';
import { NotificationHelper } from '@root/core/helpers';
import { BaseStore } from '@root/core/stores/base/BaseStore';
import { SortType } from '@root/core/types';
import { DraftSubscriptionService } from '@root/orders-and-subscriptions/api';
import { SortKey } from '@root/orders-and-subscriptions/components/TableSortableHeader/types';

import { GetCountOptions, RequestOptions } from '../subscription/types';

import { SubscriptionDraft } from './SubscriptionDraft';

export class SubscriptionDraftStore extends BaseStore<SubscriptionDraft> {
  private readonly service: DraftSubscriptionService = new DraftSubscriptionService();

  @observable allCounts = 0;
  @observable myCounts = 0;
  @observable customerCount = 0;
  @observable sortBy: SortKey = 'id';
  @observable sortOrder: SortType = 'desc';
  @observable search = '';
  @observable detailsOpen = false;
  @observable editOpen = false;

  constructor(global: GlobalStore) {
    super(global);
  }

  getCounts(mine: boolean) {
    return mine ? this.myCounts : this.allCounts;
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

      this.setItems(
        subscriptionsResponse.map((draft) => new SubscriptionDraft(this as any, draft)),
      );
    } catch (error) {
      console.error('Subscription Request Search Error:', error);
    }

    this.loading = false;
    this.loaded = true;
  }

  @actionAsync
  async request({ customerId, mine }: RequestOptions) {
    if (this.loading) {
      return;
    }
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
      customerId,
    };

    try {
      response = await task(this.service.get(options));
      this.validateLoading(response, this.limit);

      this.setItems(response.map((draft) => new SubscriptionDraft(this, draft)));
    } catch (error) {
      console.error('Subscription Request Error', error);
    }

    this.loading = false;

    this.offset += this.limit;
  }

  @actionAsync
  async requestCount({ customerId }: GetCountOptions) {
    try {
      const [draftsCountResponse, myDraftsCountResponse] = await task(
        Promise.all([
          this.service.getCount({
            customerId,
          }),
          this.service.getCount({
            mine: true,
            customerId,
          }),
        ]),
      );

      this.allCounts = draftsCountResponse.total;
      this.myCounts = myDraftsCountResponse.total;
    } catch (error) {
      console.error('Subscription RequestCount Error', error);
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
    } catch (error) {
      console.error('SubscriptionDraftStore Request Count Error', error);
    }
  }

  @actionAsync
  async getAllCustomerSubscriptions({ customerId, mine }: RequestOptions) {
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
      customerId,
    };

    try {
      const response = await task(this.service.get(options));

      this.validateLoading(response, this.limit);

      this.setItems(response.map((draft) => new SubscriptionDraft(this, draft)));
    } catch (error) {
      console.error('Subscription Request Error', error);
    }

    this.loading = false;

    this.offset += this.limit;
  }

  @actionAsync
  async requestById(id: number, options: RequestQueryParams = {}) {
    this.loading = true;
    try {
      const response = await task(this.service.getById(id, options));

      const entity = new SubscriptionDraft(this, response);

      this.setItem(entity);
      this.updateSelectedEntity(entity);

      return entity;
    } catch (error) {
      NotificationHelper.error('subscription');
    } finally {
      this.loading = false;
    }
  }
}
