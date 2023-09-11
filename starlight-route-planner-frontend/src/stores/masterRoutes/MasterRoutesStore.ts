import { format } from 'date-fns-tz';
import differenceBy from 'lodash/differenceBy';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';
import { isEmpty } from 'lodash';

import { MasterRoutesService } from '@root/api';
import { ApiError } from '@root/api/base/ApiError';
import {
  ICreateMasterRouteParams,
  IMasterRoutesListParams,
  IUpdateMasterRouteParams,
} from '@root/api/masterRoutes/types';
import { IDropResult } from '@root/common/DragNDropList/types';
import { DateFormat, MasterRouteStatus } from '@root/consts';
import { ExpandedError, NotificationHelper } from '@root/helpers';
import { ActionsParams } from '@root/pages/Dispatcher/MasterRouter/common/MasterRouteActions/types';
import {
  IMasterRoute,
  IMasterRouteEditModeNotice,
  IUnpublishMasterRouteNotice,
  JsonConversions,
  MarkerItemTypes,
  masterRouteSortKeys,
  SortType,
} from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { IHaulingServiceItemsParams } from '../../api/haulingServiceItems/types';
import { MasterRouteItem } from './MasterRoute';
import {
  IMasterRouteModalSettings,
  IServiceItemsAssignmentInfo,
  IMasterRouteGridItem,
  IMasterRouteGridUpdate,
} from './types';

export class MasterRoutesStore extends BaseStore<IMasterRoute> {
  private readonly service: MasterRoutesService;

  @observable count: number;
  @observable masterRouteModalSettings: IMasterRouteModalSettings;
  @observable isFiltersModalOpen: boolean;
  @observable currentlyUpdatingRoutes: { id: number; name: string }[];

  @observable masterRoutesGrid: IMasterRouteGridItem[];

  @observable sortBy: masterRouteSortKeys = masterRouteSortKeys.customerName;
  @observable sortOrder: SortType = 'desc';

  @observable masterRoutesGridOffset: number;
  @observable masterRoutesGridLimit: number;
  @observable masterRoutesGridLoaded: boolean;
  @observable masterRoutesGridLoading: boolean;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new MasterRoutesService();
    this.masterRouteModalSettings = {
      visible: false,
      id: undefined,
      activeTabIndex: 0,
      pinData: undefined,
    };
    this.isFiltersModalOpen = false;
    this.currentlyUpdatingRoutes = [];
    this.count = 0;
    this.masterRoutesGrid = [];
    this.masterRoutesGridOffset = 0;
    this.masterRoutesGridLimit = 25;
    this.masterRoutesGridLoaded = false;
    this.masterRoutesGridLoading = false;
  }

  @computed
  get getDropdownOptions() {
    return this.currentlyUpdatingRoutes.map(({ name, id }) => ({
      label: name,
      value: id,
    }));
  }

  @computed
  get serviceItemsAssignmentInfo() {
    return this.values.reduce((acc, { id, name, color }) => {
      acc.set(name, {
        id,
        name,
        color,
      });

      return acc;
    }, new Map<string, IServiceItemsAssignmentInfo>());
  }

  @computed
  get checkedRoutesCoordinates() {
    const checkedRoutes = this.values.filter(masterRoute => masterRoute.checked);

    if (!checkedRoutes.length) {
      return undefined;
    }

    const coordinates = [];

    for (let i = 0; i < checkedRoutes.length; i++) {
      for (let j = 0; j < checkedRoutes[i].serviceItems.length; j++) {
        coordinates.push({
          coordinates: checkedRoutes[i].serviceItems[j].jobSite.coordinates,
        });
      }
    }

    return coordinates;
  }

  @computed
  get isGridEmpty() {
    return this.masterRoutesGridLoaded && isEmpty(this.masterRoutesGrid);
  }

  @action
  getCoordinatesById(id: number) {
    const route = this.getById(id);

    return route?.serviceItems.map(({ jobSite }) => ({
      coordinates: jobSite.coordinates,
    }));
  }

  @action
  setSingleCheckedRoute(id: number) {
    // Uncheck checked checkboxes and set to selected one
    this.values.forEach(masterRoute => {
      this.setItem({
        ...masterRoute,
        checked: id === masterRoute.id,
      });
    });
  }

  @action
  toggleMasterRouteModalSettings(options?: IMasterRouteModalSettings): void {
    this.masterRouteModalSettings = {
      ...options,
      visible:
        options?.visible === undefined ? !this.masterRouteModalSettings.visible : options.visible,
    };
  }

  @action
  toggleFiltersRouteQuickView(shouldOpen?: boolean): void {
    this.isFiltersModalOpen = shouldOpen === undefined ? !this.isFiltersModalOpen : shouldOpen;
  }

  @actionAsync
  async getMasterRoutesList(
    businessUnitId: number,
    options: Omit<IMasterRoutesListParams, 'businessUnitId'> = { input: {} },
  ) {
    const tempOptions = {
      input: {
        serviceDay: options.input.serviceDaysOfWeek,
        businessLineId: options.input.businessLineId,
        serviceAreaIds: options.input.serviceAreaIds,
        materialIds: options.input.materialIds,
        equipmentIds: options.input.equipmentIds,
        frequencyIds: options.input.frequencyIds,
      },
    };

    try {
      const { masterRoutes } = await task(
        this.service.getMasterRoutesList({
          businessUnitId,
          ...tempOptions,
        }),
      );
      this.cleanup();
      if (masterRoutes.length) {
        this.setItems(masterRoutes.map(masterRoute => new MasterRouteItem(this, masterRoute)));
        this.count = masterRoutes.length;
      } else {
        this.count = 0;
      }
    } catch (error) {
      ExpandedError.sentryWithNotification({
        error,
        action: 'getMasterRoutesList',
      });
    }
  }

  @actionAsync
  async getCount(businessUnitId: number) {
    try {
      const { masterRoutesCount } = await task(this.service.getCount(businessUnitId));

      this.count = masterRoutesCount.count;
    } catch (error) {
      console.error('Get master routes list', error);
    }
  }

  @actionAsync
  async createMasterRoute(options: ICreateMasterRouteParams) {
    try {
      const { createMasterRoute } = await task(this.service.createMasterRoute(options));

      this.globalStore.haulingServiceItemStore.getHaulingServiceItems();

      this.setItem(new MasterRouteItem(this, createMasterRoute));
      this.count++;

      NotificationHelper.success('createMasterRoute', createMasterRoute.id);
    } catch (error) {
      const e = error as ApiError;

      if (e.isConflictFailed) {
        return e;
      }

      ExpandedError.sentryWithNotification({
        error,
        action: 'createMasterRoute',
      });
    }
  }

  @actionAsync
  async updateMasterRoute(options: IUpdateMasterRouteParams) {
    try {
      const { updateMasterRoute } = await task(this.service.updateMasterRoute(options));

      this.globalStore.haulingServiceItemStore.getHaulingServiceItems();

      updateMasterRoute.checked = true;

      this.setItem(new MasterRouteItem(this, updateMasterRoute));

      NotificationHelper.success('updateMasterRoute', options.id);
    } catch (error) {
      const e = error as ApiError;

      if (e.isConflictFailed) {
        return e;
      }

      ExpandedError.sentryWithNotification({ error, action: 'updateMasterRoute' }, [options.id]);
    }
  }

  @actionAsync
  async enableEditMode(id: number) {
    try {
      const { enableMasterRouteEditMode } = await task(this.service.enableEditMode(id));

      const { __typename, ...enableEditData } = enableMasterRouteEditMode;

      // TODO: revisit this, probably need to refetch master route by id if this happens
      if (__typename === 'EnableEditModeNotice') {
        const masterRoute = this.getById(id);

        return <IMasterRouteEditModeNotice>{
          ...enableEditData,
          name: masterRoute?.name,
          id,
        };
      }

      if (__typename === 'MasterRoute') {
        this.setItem(new MasterRouteItem(this, <JsonConversions<IMasterRoute>>enableEditData));
      }

      return undefined;
    } catch (error) {
      ExpandedError.sentryWithNotification({
        error,
        action: 'enableEditMasterRouteMode',
      });
    }
  }

  @actionAsync
  async disableEditMode(id?: number) {
    try {
      if (!id) {
        return;
      }

      const { disableMasterRouteEditMode: masterRoute } = await task(
        this.service.disableEditMode(id),
      );

      masterRoute.checked = true;

      this.setItem(new MasterRouteItem(this, masterRoute));

      return true;
    } catch (error) {
      ExpandedError.sentryWithNotification({
        error,
        action: 'disableEditMasterRouteMode',
      });
    }

    return false;
  }

  @actionAsync
  async publishMasterRoute(variables: { id: number; publishDate: Date }) {
    try {
      const sanitizedVars = {
        id: variables.id,
        publishDate: format(variables.publishDate, DateFormat.DateSerialized),
      };
      const { publishMasterRoute } = await task(this.service.publishMasterRoute(sanitizedVars));

      publishMasterRoute.checked = true;

      this.currentlyUpdatingRoutes.push({
        id: publishMasterRoute.id,
        name: publishMasterRoute.name,
      });

      this.setItem(new MasterRouteItem(this, publishMasterRoute));

      NotificationHelper.success('publishMasterRoute', variables.id);
    } catch (error) {
      ExpandedError.sentryWithNotification({ error, action: 'publishMasterRoute' }, [variables.id]);
    }
  }

  @actionAsync
  async unpublishMasterRoute(id: number, force: boolean) {
    try {
      const { unpublishMasterRoute } = await task(
        this.service.unpublishMasterRoute(id, force || false),
      );

      const { __typename, ...unpublishData } = unpublishMasterRoute;

      if (__typename === 'UnpublishMasterRouteNotice') {
        const masterRoute = this.getById(id);

        return <IUnpublishMasterRouteNotice>{
          ...unpublishData,
          name: masterRoute?.name,
          id,
        };
      }

      if (__typename === 'MasterRoute') {
        this.setItem(
          new MasterRouteItem(this, <JsonConversions<IMasterRoute>>{
            ...unpublishData,
            checked: true,
          }),
        );
      }

      NotificationHelper.success('unpublishMasterRoute', id);

      return undefined;
    } catch (error) {
      ExpandedError.sentryWithNotification({ error, action: 'unpublishMasterRoute' }, [id]);
    }
  }

  @actionAsync
  async checkUpdatingRoutes(businessUnitId: number) {
    try {
      if (!businessUnitId) {
        return;
      }

      const { updatingMasterRoutesList } = await task(
        this.service.getUpdatingMasterRoute(businessUnitId),
      );

      const newUpdatingRoutesList = updatingMasterRoutesList.map(item => ({
        id: item.id,
        name: item.name,
      }));

      const finishedUpdating = differenceBy(
        this.currentlyUpdatingRoutes,
        newUpdatingRoutesList,
        'id',
      );

      // Update all client-side routes that just finished publishing/updating with a proper status
      // without an extra api call
      finishedUpdating.forEach(routeData => {
        const existingRoute = this.values.find(route => route.id === routeData.id);

        if (!existingRoute) {
          return;
        }

        const newRoute = {
          ...existingRoute,
          status: MasterRouteStatus.ACTIVE,
          published: true,
        };

        this.setItem(newRoute);
      });

      this.currentlyUpdatingRoutes = newUpdatingRoutesList;
    } catch (error) {
      ExpandedError.sentry({ error, action: 'checkUpdatingRoutes' });
    }
  }

  @actionAsync
  async fetchMasterRouteById(id: number) {
    try {
      const { masterRoute } = await task(this.service.getMasterRoute(id));

      return new MasterRouteItem(this, masterRoute);
    } catch (error) {
      ExpandedError.sentry({ error, action: 'getMasterRoute' });
    }
  }

  @actionAsync
  async getAvailableColor() {
    try {
      const { availableMasterRouteColor } = await task(this.service.getAvailableColor());

      return availableMasterRouteColor.color;
    } catch (error) {
      ExpandedError.sentry({ error, action: 'getAvailableColor' });
    }
  }

  @action
  clearUpdatingRoutesList() {
    this.currentlyUpdatingRoutes = [];
  }

  @action
  checkIfShouldEnterEditMode() {
    const userLoginLobby = localStorage.getItem('user-login:lobby');

    if (!userLoginLobby) {
      return;
    }

    const user = JSON.parse(userLoginLobby).me;

    for (const masterRoute of this.values) {
      if (masterRoute.status === MasterRouteStatus.EDITING && masterRoute.editorId === user?.id) {
        this.toggleMasterRouteModalSettings({
          visible: true,
          id: masterRoute.id,
          activeTabIndex: 1,
          pinData: {
            ...masterRoute,
            type: MarkerItemTypes.MASTER_ROUTES,
          } as ActionsParams as IDropResult,
        });
        break;
      }
    }
  }

  @computed
  get getMasterRouteByModalSettings() {
    if (!this.masterRouteModalSettings.id) {
      return null;
    }

    return this.getById(this.masterRouteModalSettings.id);
  }

  @computed
  get hasMore() {
    return this.values.length < this.count;
  }

  @action
  setNewRoute(id: number, route: number) {
    const service = this.masterRoutesGrid.find(entry => entry.id == id);
    if (service) {
      service.newRoute = route;
    }
  }

  @action
  setNewSequence(id: number, sequence: number) {
    const service = this.masterRoutesGrid.find(entry => entry.id == id);
    if (service) {
      service.newSequence = sequence;
    }
  }

  @action
  setNewServiceDay(id: number, serviceDay: number) {
    const service = this.masterRoutesGrid.find(entry => entry.id == id);
    if (service) {
      service.newServiceDate = serviceDay;
    }
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
  async getMasterRoutesGrid(businessUnitId: number, options?: IHaulingServiceItemsParams) {
    if (options?.resetOffset) {
      this.masterRoutesGridOffset = 0;
      this.masterRoutesGrid = [];
    }
    const filters = {
      serviceDay: options?.serviceDaysOfWeek,
      businessLineId: options?.businessLineId ? options.businessLineId : null,
      serviceAreaIds: options?.serviceAreaIds,
      materialIds: options?.materialIds,
      equipmentIds: options?.equipmentIds,
      frequencyIds: options?.frequencyIds,
      routeId: options?.routeId,
      skip: this.masterRoutesGridOffset,
      limit: this.masterRoutesGridLimit,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };
    try {
      this.masterRoutesGridLoading = true;
      const result = await task(this.service.getMasterRouteGrid(businessUnitId, filters));
      const masterRoutesGrid: IMasterRouteGridItem[] = [];

      result.masterRouteGrid.forEach(async route => {
        route.originalSequence = route.currentSequence;
        masterRoutesGrid.push(route as IMasterRouteGridItem);
      });
      if (this.masterRoutesGridOffset > 0) {
        this.masterRoutesGrid = [...this.masterRoutesGrid, ...masterRoutesGrid];
      } else {
        this.masterRoutesGrid = masterRoutesGrid;
      }

      if (isEmpty(masterRoutesGrid)) {
        this.masterRoutesGridLoaded = true;
      } else {
        this.masterRoutesGridOffset += masterRoutesGrid.length;
        if (masterRoutesGrid.length < this.masterRoutesGridLimit) {
          this.masterRoutesGridLoaded = true;
        }
      }
    } catch (error: unknown) {
      ExpandedError.sentryWithNotification({
        error,
        action: 'getMasterRoutesGrid',
      });
      this.masterRoutesGridLoaded = true;
    } finally {
      this.masterRoutesGridLoading = false;
    }
  }

  @actionAsync
  async updateMasterRoutesGrid(data: IMasterRouteGridUpdate) {
    try {
      await task(this.service.updateMasterRouteGrid(data));
      NotificationHelper.success('updateMasterRoutesGrid');
    } catch (error) {
      ExpandedError.sentryWithNotification({
        error,
        action: 'updateMasterRoutesGrid',
      });
    }
  }

  @action.bound
  setSort(sortBy: masterRouteSortKeys, sortOrder: SortType) {
    this.sortOrder = sortOrder;
    this.sortBy = sortBy;
  }

  @action.bound
  async sortMasterRouteGrid(
    sortBy: masterRouteSortKeys,
    sortOrder: SortType,
    businessUnitId: number,
    filters: IHaulingServiceItemsParams,
  ) {
    this.setSort(sortBy, sortOrder);

    await this.getMasterRoutesGrid(businessUnitId, filters);
  }
}
