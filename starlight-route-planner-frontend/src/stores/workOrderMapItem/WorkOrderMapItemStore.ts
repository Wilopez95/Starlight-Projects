import { format } from 'date-fns';
import Fuse from 'fuse.js';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import {
  ICheckWorkOrdersRouteStatus,
  IWorkOrdersDailyRouteParams,
  WorkOrdersDailyRouteService,
} from '@root/api/workOrdersDailyRoute';
import { ISearchDropDownItem } from '@root/common';
import { DateFormat } from '@root/consts';
import { formatAddress, fuseHighlight, normalizeListOptions } from '@root/helpers';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { IWorkOrderMapItem } from './types';
import { WorkOrderMapItem } from './WorkOrderMapItem';

export class WorkOrderMapItemStore extends BaseStore<IWorkOrderMapItem> {
  private readonly service: WorkOrdersDailyRouteService;
  private readonly fuseOptions: Fuse.IFuseOptions<IWorkOrderMapItem> = {
    keys: [
      'id',
      'orderId',
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
  // Local variables for quick-view filter
  businessLineId?: number;
  serviceAreaIds?: number[];
  materialIds?: number[];
  equipmentItemIds?: number[];

  @observable showSearchedServiceItems = false;
  @observable searchedServiceItems: ISearchDropDownItem[] = [];
  // AddMultipleWO
  @observable checkedWorkOrdersRouteStatus: ICheckWorkOrdersRouteStatus | null;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new WorkOrdersDailyRouteService();
    this.checkedWorkOrdersRouteStatus = null;
  }

  @computed
  get getListFilters() {
    return {
      businessLineId: this.businessLineId,
      serviceAreaIds: this.serviceAreaIds,
      materialIds: this.materialIds,
      equipmentItemIds: this.equipmentItemIds,
    };
  }

  @actionAsync
  async getWorkOrderWithDailyRouteList(
    id: number,
    options?: Omit<IWorkOrdersDailyRouteParams, 'serviceDate'>,
  ) {
    try {
      this.loading = true;

      if (!options) {
        options = this.getListFilters as Omit<IWorkOrdersDailyRouteParams, 'serviceDate'>;
      }

      this.businessLineId = options.businessLineId;
      this.serviceAreaIds = options.serviceAreaIds;
      this.materialIds = options.materialIds;
      this.equipmentItemIds = options.equipmentItemIds;

      const normalized = normalizeListOptions({
        ...options,
        serviceDate: format(
          this.globalStore.dailyRoutesStore.selectedServiceDate,
          DateFormat.DateSerialized,
        ),
      });

      const { workOrdersDailyRoute } = await task(
        this.service.getWorkOrderWithDailyRouteList(id, normalized as IWorkOrdersDailyRouteParams),
      );

      if (this.values.length) {
        this.cleanup();
      }

      this.validateLoading(workOrdersDailyRoute, this.limit);

      this.setItems(
        workOrdersDailyRoute.map(
          workOrder => new WorkOrderMapItem(this as WorkOrderMapItemStore, workOrder),
        ),
      );
    } catch (error) {
      console.error('Get Work Order List Request Error', error);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async checkWorkOrdersRouteStatus(ids: number[]) {
    try {
      const { checkWorkOrdersRouteStatus } = await task(
        this.service.checkWorkOrdersRouteStatus(ids),
      );

      this.checkedWorkOrdersRouteStatus = checkWorkOrdersRouteStatus;

      return checkWorkOrdersRouteStatus === null || !checkWorkOrdersRouteStatus.updating.length;
    } catch (error) {
      console.error('Check work orders route status', error);
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
        title: `WO #${_highlight.id}・Parent Order #${_highlight.orderId}`,
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
