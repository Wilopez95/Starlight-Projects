import Fuse from 'fuse.js';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { HaulingServiceItemsService } from '@root/api';
import {
  ICheckServiceItemsRouteStatus,
  IHaulingServiceItemsParams,
  IHaulingServiceItemsQueryParams,
} from '@root/api/haulingServiceItems/types';
import { ISearchDropDownItem } from '@root/common';
import { formatAddress, fuseHighlight, normalizeListOptions } from '@root/helpers';
import { IHaulingServiceItem } from '@root/types';

import { isEmpty } from 'lodash-es';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { HaulingServiceItem } from './HaulingServiceItem';

export class HaulingServiceItemStore extends BaseStore<IHaulingServiceItem> {
  private readonly service: HaulingServiceItemsService;
  private readonly fuseOptions: Fuse.IFuseOptions<IHaulingServiceItem> = {
    keys: [
      'id',
      'subscriptionId',
      'jobSite.address.addressLine1',
      'jobSite.address.addressLine2',
      'jobSite.address.city',
      'jobSite.address.fullAddress',
      'jobSite.address.state',
      'jobSite.address.zip',
    ],
    includeScore: true,
    minMatchCharLength: 3,
    includeMatches: true,
    threshold: 0.0,
    ignoreLocation: true,
  };

  private haulingServiceItemsFilterOptions?: IHaulingServiceItemsParams;
  private businessUnitId?: number;

  @observable showSearchedServiceItems = false;
  @observable searchedServiceItems: ISearchDropDownItem[] = [];

  // AddMultipleServiceItems
  @observable
  checkedServiceItemsRouteStatus: ICheckServiceItemsRouteStatus | null;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new HaulingServiceItemsService();
    this.checkedServiceItemsRouteStatus = null;
  }

  @actionAsync
  async getHaulingServiceItems(businessUnitId?: number, options?: IHaulingServiceItemsParams) {
    try {
      if (businessUnitId) {
        this.businessUnitId = businessUnitId;
      }

      if (options) {
        this.haulingServiceItemsFilterOptions = options;
      }

      if (!this.businessUnitId) {
        return;
      }

      this.loading = true;

      const normalized = normalizeListOptions(this.haulingServiceItemsFilterOptions ?? {});
      const { haulingServiceItems } = await task(
        this.service.getHaulingServiceItems(
          this.businessUnitId,
          normalized as IHaulingServiceItemsQueryParams,
        ),
      );

      if (!isEmpty(this.values)) {
        this.cleanup();
      }

      this.validateLoading(haulingServiceItems, this.limit);

      this.setItems(
        haulingServiceItems.map(
          haulingServiceItem => new HaulingServiceItem(this, haulingServiceItem),
        ),
      );
    } catch (error) {
      console.error('OrderSubscriptionService Request Count Error', error);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async checkServiceItemsRouteStatus(ids: number[]) {
    try {
      const { checkServiceItemsRouteStatus } = await task(
        this.service.checkServiceItemsRouteStatus(ids),
      );

      this.checkedServiceItemsRouteStatus = checkServiceItemsRouteStatus;

      return (
        checkServiceItemsRouteStatus === null ||
        (!checkServiceItemsRouteStatus.published.length &&
          !checkServiceItemsRouteStatus.updating.length)
      );
    } catch (error) {
      console.error('Check service items route status', error);
    }
  }

  // Search

  @action.bound
  setSearchedServiceItems(items: ISearchDropDownItem[]) {
    this.searchedServiceItems = items;
  }

  @action.bound
  setShowSearchedServiceItems(visible: boolean) {
    this.showSearchedServiceItems = visible;
  }

  @computed
  private get fuse() {
    return new Fuse(this.values, this.fuseOptions);
  }

  @action.bound
  onSearch(search: string) {
    this.setShowSearchedServiceItems(true);

    const searchResults = this.fuse.search(search, {
      limit: 10,
    });

    const results: ISearchDropDownItem[] = searchResults.map(fuseItem => {
      const _highlight = fuseHighlight(fuseItem, this.fuseOptions.keys);

      return {
        id: fuseItem.item.id,
        title: `Service #${_highlight.id}・Subscription #${_highlight.subscriptionId}`,
        subTitle: formatAddress(_highlight.jobSite.address),
        coordinates: fuseItem.item.jobSite.coordinates,
        jobSiteId: fuseItem.item.jobSiteId,
        rootMarkerId: fuseItem.item.id,
        pinItemId: fuseItem.item.id,
        color: '',
      };
    });

    this.setSearchedServiceItems(results);
  }
}
