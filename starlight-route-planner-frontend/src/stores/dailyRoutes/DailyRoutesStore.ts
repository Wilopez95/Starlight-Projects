import { addDays, format } from 'date-fns';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { ApiError } from '@root/api/base/ApiError';
import { DailyRoutesService } from '@root/api/dailyRoutes/dailyRoutes';
import { ICreateDailyRouteParams, IUpdateDailyRouteParams } from '@root/api/dailyRoutes/types';
import { DateFormat } from '@root/consts';
import { ExpandedError, NotificationHelper } from '@root/helpers';
import {
  IDailyRoute,
  IDailyRouteEditModeNotice,
  IDailyRouteNamesListParams,
  IDailyRoutesListParams,
  JsonConversions,
} from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { DailyRouteItem } from './DailyRoute';
import { IDailyRouteModalSettings, IDailyRouteModalSettingsParams } from './types';

export class DailyRoutesStore extends BaseStore<IDailyRoute> {
  private readonly service: DailyRoutesService;

  @observable isFiltersModalOpen: boolean;
  @observable count: number;
  @observable selectedServiceDate: Date;
  @observable dailyRouteModalSettings: IDailyRouteModalSettings;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new DailyRoutesService();
    this.isFiltersModalOpen = false;
    this.count = 0;
    this.selectedServiceDate = addDays(new Date(), 1);
    this.dailyRouteModalSettings = {
      visible: false,
      id: undefined,
    };
  }

  @action.bound
  toggleDailyRouteModalSettings(options?: IDailyRouteModalSettingsParams): void {
    const { dailyRoute, ...restParams } = options ?? {};

    this.dailyRouteModalSettings = {
      id: dailyRoute?.id,
      ...restParams,
      visible:
        options?.visible === undefined ? !this.dailyRouteModalSettings.visible : options.visible,
    };
  }

  @computed
  get getDailyRouteByModalSettings() {
    if (!this.dailyRouteModalSettings.id) {
      return null;
    }

    return this.getById(this.dailyRouteModalSettings.id);
  }

  @computed
  get checkedRoutesCoordinates() {
    const checkedRoutes = this.values.filter(dailyRoute => dailyRoute.checked);

    if (!checkedRoutes.length) {
      return undefined;
    }

    const coordinates = [];

    for (let i = 0; i < checkedRoutes.length; i++) {
      for (let j = 0; j < checkedRoutes[i].workOrders.length; j++) {
        coordinates.push({
          coordinates: checkedRoutes[i].workOrders[j].jobSite.coordinates,
        });
      }
    }

    return coordinates;
  }

  @action
  getCoordinatesById(id: number) {
    const route = this.getById(id);

    return route?.workOrders.map(({ jobSite }) => ({
      coordinates: jobSite.coordinates,
    }));
  }

  @action
  setSingleCheckedRoute(id: number) {
    // Uncheck checked checkboxes and set to selected one
    this.values.forEach(dailyRoute => {
      this.setItem({
        ...dailyRoute,
        checked: id == dailyRoute.id,
      });
    });
  }

  @actionAsync
  async getDailyRouteNamesList(businessUnitId: number, queryOptions: IDailyRouteNamesListParams) {
    try {
      const { dailyRoutes } = await task(
        this.service.getDailyRouteNamesList(businessUnitId, queryOptions),
      );

      return dailyRoutes;
    } catch (error) {
      ExpandedError.sentry({ error, action: 'getDailyRouteNamesList' });
    }
  }

  @actionAsync
  async getDailyRoutesListExpanded(
    id: number,
    queryOptions: Pick<IDailyRoutesListParams, 'serviceDate'> = {},
    options: {
      resetOffset: boolean;
      cleanUp: boolean;
    } = {
      resetOffset: false,
      cleanUp: false,
    },
  ) {
    try {
      if (options.resetOffset) {
        this.offset = 0;
      }

      if (options.cleanUp) {
        this.cleanup();
      }

      const { dailyRoutes } = await task(
        this.service.getDailyRoutesListExpanded(id, {
          ...queryOptions,
          serviceDate: format(this.selectedServiceDate, DateFormat.DateSerialized),
          skip: this.offset,
          limit: this.limit,
        }),
      );

      this.validateLoading(dailyRoutes, this.limit);

      if (dailyRoutes.length) {
        dailyRoutes.forEach(dailyRoute => {
          dailyRoute.workOrders.forEach(workOrder => {
            workOrder.dailyRoute = {
              ...dailyRoute,
              workOrders: dailyRoute.workOrders, //.map(( workOrderItem ) => ({id:workOrderItem.id})) ,
            };
          });
        });

        this.setItems(dailyRoutes.map(dailyRoute => new DailyRouteItem(this, dailyRoute)));

        this.offset += this.limit;
      }
    } catch (error) {
      ExpandedError.sentryWithNotification({
        error,
        action: 'getDailyRoutesListExpanded',
      });
    }
  }

  @actionAsync
  async getCount(businessUnitId: number) {
    try {
      const { dailyRoutesCount } = await task(
        this.service.getCount(
          businessUnitId,
          format(this.selectedServiceDate, DateFormat.DateSerialized),
        ),
      );

      this.count = dailyRoutesCount.count;
    } catch (error) {
      console.error('Get daily routes count', error);
    }
  }

  @actionAsync
  async enableEditMode(id: number) {
    try {
      const { enableDailyRouteEditMode } = await task(this.service.enableEditMode(id));

      const { __typename, ...enableEditData } = enableDailyRouteEditMode;

      // TODO: revisit this, probably need to refetch daily route by id if this happens
      if (__typename === 'EnableEditModeNotice') {
        const dailyRoute = this.getById(id);

        return <IDailyRouteEditModeNotice>{
          ...enableEditData,
          name: dailyRoute?.name,
          id,
        };
      }

      if (__typename === 'DailyRoute') {
        this.setItem(new DailyRouteItem(this, <JsonConversions<IDailyRoute>>enableEditData));
      }
    } catch (error) {
      ExpandedError.sentryWithNotification({
        error,
        action: 'enableDailyRoutesEditMode',
      });
    }
  }

  @actionAsync
  async disableEditMode(id?: number) {
    try {
      if (!id) {
        return;
      }

      const { disableDailyRouteEditMode: dailyRoute } = await task(
        this.service.disableEditMode(id),
      );

      dailyRoute.checked = true;

      this.setItem(new DailyRouteItem(this, dailyRoute));

      return true;
    } catch (error) {
      ExpandedError.sentryWithNotification({
        error,
        action: 'disableDailyRoutesEditMode',
      });
    }

    return false;
  }

  @action
  toggleFiltersRouteQuickView(shouldOpen?: boolean): void {
    this.isFiltersModalOpen = shouldOpen === undefined ? !this.isFiltersModalOpen : shouldOpen;
  }

  @action
  setSelectedServiceDate(date: Date) {
    this.selectedServiceDate = date;
  }

  @action
  toggleCheckItem(id: number) {
    const item = this.getById(id);

    if (item) {
      this.setItem({
        ...item,
        checked: !item.checked,
      });
    }
  }

  @actionAsync
  async getAvailableColor() {
    try {
      const { availableDailyRouteColor } = await task(this.service.getAvailableColor());

      return availableDailyRouteColor.color;
    } catch (error) {
      ExpandedError.sentry({
        error,
        action: 'DailyRouteStore - getAvailableColor',
      });
    }
  }

  @actionAsync
  async createDailyRoute(businessUnitId: number, options: ICreateDailyRouteParams) {
    try {
      const { createDailyRoute } = await task(
        this.service.createDailyRoute(businessUnitId, options),
      );

      // To update pins assets
      this.globalStore.workOrderDailyRouteStore.getWorkOrderWithDailyRouteList(businessUnitId);

      // Refresh DR counter
      this.getCount(businessUnitId);

      this.setItem(new DailyRouteItem(this, createDailyRoute));

      NotificationHelper.success('createDailyRoute', createDailyRoute.id);
    } catch (error) {
      const e = error as ApiError;

      if (e.isConflictFailed) {
        return e;
      }

      ExpandedError.sentryWithNotification({
        error,
        action: 'createDailyRoute',
      });
    }
  }

  @actionAsync
  async updateDailyRoute(businessUnitId: number, options: IUpdateDailyRouteParams) {
    try {
      const { updateDailyRoute } = await task(this.service.updateDailyRoute(options));

      updateDailyRoute.checked = true;

      // To update pins assets
      this.globalStore.workOrderDailyRouteStore.getWorkOrderWithDailyRouteList(businessUnitId);

      this.setItem(new DailyRouteItem(this, updateDailyRoute));

      NotificationHelper.success('updateDailyRoute', options.name);
    } catch (error) {
      const e = error as ApiError;

      if (e.isConflictFailed) {
        return e;
      }

      ExpandedError.sentryWithNotification({ error, action: 'updateDailyRoute' }, [options.name]);
    }
  }

  @actionAsync
  async fetchDailyRouteById(id: number) {
    try {
      const { dailyRoute } = await task(this.service.getDailyRoute(id));

      return new DailyRouteItem(this, dailyRoute);
    } catch (error) {
      ExpandedError.sentry({ error, action: 'getDailyRoute' });
    }
  }

  @computed
  get hasMore() {
    return this.values.length < this.count;
  }
}
