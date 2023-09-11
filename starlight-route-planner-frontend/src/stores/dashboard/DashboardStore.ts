import { orderBy } from 'lodash-es';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { DashboardService, IDashboardParams } from '@root/api';
import { ApiError } from '@root/api/base/ApiError';
import { BusinessLineTypeSymbol, DailyRouteStatus } from '@root/consts';
import {
  ExpandedError,
  formatServiceDate,
  normalizeListOptions,
  NotificationHelper,
} from '@root/helpers';
import {
  IDailyRoute,
  IDashboardDailyRoute,
  IServiceArea,
  SortType,
  DashboardDailyRouteKeys,
} from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { DashboardDailyRoute } from './DashboardDailyRoute';
import {
  IUpdateDashboardDailyRouteParams,
  IWeightTicketDetailsSettings,
  IWeightTicketModalSettings,
} from './types';

export class DashboardStore extends BaseStore<IDashboardDailyRoute> {
  private readonly service: DashboardService;

  @observable serviceDate: Date;
  @observable sortBy: DashboardDailyRouteKeys = DashboardDailyRouteKeys.id;
  @observable sortOrder: SortType = 'desc';
  @observable quickViewSettings: {
    visible: boolean;
    id?: number;
    status?: DailyRouteStatus;
  };
  @observable weightTicketModalSettings: IWeightTicketModalSettings;
  @observable weightTicketDetailsSettings: IWeightTicketDetailsSettings;
  serviceAreas?: IServiceArea[] = [];
  statuses?: DailyRouteStatus[] = [];
  truckTypes?: string[] = [];
  businessLineTypes?: BusinessLineTypeSymbol[] = [];
  serviceAreaIds?: number[] = [];
  searchInput?: string;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new DashboardService();

    this.serviceDate = new Date();
    this.quickViewSettings = {
      visible: false,
      id: undefined,
      status: undefined,
    };

    this.weightTicketModalSettings = {
      visible: false,
      isEdit: false,
    };

    this.weightTicketDetailsSettings = {
      weightTickets: undefined,
      initialIndex: undefined,
      materialIds: undefined,
    };
  }

  @action.bound
  toggleQuickViewSettings(settings?: {
    visible?: boolean;
    dailyRoute?: IDashboardDailyRoute | IDailyRoute;
  }): void {
    const { visible, dailyRoute } = settings ?? {};

    this.quickViewSettings = {
      visible: visible === undefined ? !this.quickViewSettings.visible : visible,
      id: dailyRoute?.id,
      status: dailyRoute?.status,
    };
  }

  @computed
  get getDailyRouteByQuickViewSettings() {
    if (!this.quickViewSettings.id) {
      return null;
    }

    return this.getById(this.quickViewSettings.id);
  }

  @action.bound
  setSort(sortBy: DashboardDailyRouteKeys, sortOrder: SortType) {
    this.sortOrder = sortOrder;
    this.sortBy = sortBy;
  }

  @action
  setServiceDate(date: Date) {
    this.serviceDate = date;
  }

  @action.bound
  sortDailyRoutes(sortBy: DashboardDailyRouteKeys, sortOrder: SortType) {
    this.loading = true;
    this.setSort(sortBy, sortOrder);
    const sortFunction = (dailyRoute: IDashboardDailyRoute) => {
      if (sortBy === 'updatedAt') {
        return new Date(dailyRoute[sortBy]);
      }

      return dailyRoute[sortBy];
    };

    const sorted = orderBy(this.values, [sortFunction, 'id'], sortOrder);

    this.cleanup();
    this.setItems(sorted);
    this.loading = false;
  }

  @action.bound
  toggleWeightTicketModal(options?: IWeightTicketModalSettings) {
    const { visible, isEdit = false, ...restOptions } = options ?? {};

    this.weightTicketModalSettings = {
      ...restOptions,
      isEdit,
      visible: visible === undefined ? !this.weightTicketModalSettings.visible : visible,
    };
  }

  @action.bound
  toggleWeightTicketDetails(options?: IWeightTicketDetailsSettings) {
    this.weightTicketDetailsSettings = {
      ...options,
    };
  }

  @actionAsync
  async getDashboardList(
    id: number,
    values: Omit<IDashboardParams, 'serviceDate'>,
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

      this.businessLineTypes = values.businessLineTypes;
      this.truckTypes = values.truckTypes;
      this.serviceAreaIds = values.serviceAreaIds;
      this.statuses = values.statuses;

      await task(this.queryDashboardList(id));
    } catch (error) {
      console.error('Get Dashboard List Request Error', error);
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

      await task(this.queryDashboardList(businessUnitId));
    } catch (error) {
      ExpandedError.sentry({ error, action: 'onSearch' });
      this.loaded = true;
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  private async queryDashboardList(businessUnitId: number) {
    this.loading = true;
    const serviceDate = formatServiceDate(this.serviceDate);

    const normalized = normalizeListOptions({
      businessLineTypes: this.businessLineTypes,
      serviceAreaIds: this.serviceAreaIds,
      statuses: this.statuses,
      truckTypes: this.truckTypes,
    });

    try {
      const { dailyRoutesDashboard } = await task(
        this.service.getDashboardList(
          businessUnitId,
          {
            ...normalized,
            serviceDate,
          },
          this.searchInput,
        ),
      );

      this.validateLoading(dailyRoutesDashboard, this.limit);

      if (dailyRoutesDashboard.length) {
        this.setItems(
          dailyRoutesDashboard.map(dailyRoute => new DashboardDailyRoute(this, dailyRoute)),
        );

        this.offset += this.limit;
      }
    } catch (error) {
      ExpandedError.sentryWithNotification({
        error,
        action: 'queryDashboardList',
      });
    }
  }

  @actionAsync
  async updateDashboardDailyRoute(dailyRouteId: number, data: IUpdateDashboardDailyRouteParams) {
    try {
      this.toggleQuickViewLoading();

      const { weightTicketsToCreate, weightTicketsToEdit, weightTicketIdsToDelete, ...rest } = data;
      const normalized = normalizeListOptions(rest);

      const createWeightTicketPromises = weightTicketsToCreate.map(weightTicket => {
        const { media, ...weightTicketRest } = weightTicket;

        return this.globalStore.weightTicketStore.createWeightTicket(dailyRouteId, {
          ...weightTicketRest,
          media,
        });
      });

      const updateWeightTicketPromises = weightTicketsToEdit.map(weightTicket => {
        const { media, ...weightTicketRestUpdate } = weightTicket;

        return this.globalStore.weightTicketStore.updateWeightTicket({
          ...weightTicketRestUpdate,
          media,
        });
      });

      const deleteWeightTicketPromises = weightTicketIdsToDelete.map(id =>
        this.globalStore.weightTicketStore.deleteWeightTicket(id),
      );

      const result = await task(
        Promise.all([
          ...createWeightTicketPromises,
          ...updateWeightTicketPromises,
          ...deleteWeightTicketPromises,
        ]),
      );

      const conflictErrors = result.filter(item => {
        if (item?.hasOwnProperty('error')) {
          const typedItem = item as {
            id: number | undefined;
            error?: { isConflictFailed: boolean };
          };
          return typedItem.error?.isConflictFailed;
        }

        return false;
      });

      if (conflictErrors.length > 0) {
        return conflictErrors;
      }

      const { updateDailyRouteQuickViewInfo } = await task(
        this.service.updateDashboardDailyRoute(
          dailyRouteId,
          normalized as IUpdateDashboardDailyRouteParams,
        ),
      );

      this.setItem(new DashboardDailyRoute(this, updateDailyRouteQuickViewInfo));

      await this.globalStore.dailyRoutesStore.disableEditMode(dailyRouteId);

      NotificationHelper.success('updateDashboardDailyRoute', data.name);
    } catch (error) {
      ExpandedError.sentryWithNotification({ error, action: 'updateDashboardDailyRoute' }, [
        data.name,
      ]);

      const e = error as ApiError;

      if (e.isConflictFailed) {
        return e;
      }
    } finally {
      this.toggleQuickViewLoading();
    }
  }

  @actionAsync
  async fetchDashboardDailyRouteById(id: number) {
    try {
      const { dailyRoute } = await task(this.service.getDailyRoute(id));

      return new DashboardDailyRoute(this, dailyRoute);
    } catch (error) {
      console.error('Get dashboard daily route', error);
    }
  }

  @actionAsync
  async getDailyRouteReport(dailyRouteId: number) {
    try {
      this.loading = true;
      const { dailyRouteReport } = await task(this.service.getDailyRouteReport(dailyRouteId));

      return { ...dailyRouteReport };
    } catch (error) {
      ExpandedError.sentryWithNotification({
        error,
        action: 'getDailyRouteReport',
      });
    } finally {
      this.loading = false;
    }
  }
}
