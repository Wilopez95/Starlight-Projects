import * as Sentry from '@sentry/react';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { ServiceAreaService } from '@root/api/serviceArea/serviceArea';
import { NotificationHelper } from '@root/helpers';
import { IServiceArea } from '@root/types';
import { IBusinessContextIds } from '@root/types/base/businessContext';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { ServiceArea } from './ServiceArea';

export class ServiceAreaStore extends ConfigurationDataBaseStore<ServiceArea> {
  private readonly service: ServiceAreaService;
  @observable private buData = new Map<number, ServiceArea>();

  constructor(global: GlobalStore) {
    super(global, ['name']);

    this.service = new ServiceAreaService();
  }

  @actionAsync
  async request(
    {
      businessLineId,
      businessUnitId,
    }: {
      businessLineId?: string;
      businessUnitId: string;
    },
    preselectedServiceAreaId?: number,
  ) {
    this.loading = true;
    try {
      const serviceAreas = await task(this.service.get({ businessLineId, businessUnitId }));

      const setItems = businessLineId ? this.setItems : this.setBUItems;

      setItems.call(
        this,
        serviceAreas.map(serviceArea => new ServiceArea(this, serviceArea)),
      );

      const selected = this.getById(preselectedServiceAreaId);

      selected && this.selectEntity(selected, false);

      return selected;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'ServiceArea',
        data: {
          businessLineId,
          businessUnitId,
          preselectedServiceAreaId,
        },
        message: `Service Areas Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async requestByJobSite({
    jobSiteId,
    businessUnitId,
    businessLineId,
    activeOnly,
  }: { jobSiteId: number; activeOnly: boolean } & IBusinessContextIds) {
    this.loading = true;
    try {
      const serviceAreasObj = await task(
        this.service.requestByJobSite({ jobSiteId, businessUnitId, businessLineId, activeOnly }),
      );

      this.cleanup();

      this.setItems(
        serviceAreasObj.matched.map(serviceArea => new ServiceArea(this, serviceArea, true)),
      );
      this.setItems(
        serviceAreasObj.unmatched.map(serviceArea => new ServiceArea(this, serviceArea)),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'ServiceArea',
        data: {
          jobSiteId,
          businessUnitId,
          businessLineId,
          activeOnly,
        },
        message: `Service Areas Request By Job Site Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(data: IServiceArea) {
    try {
      await task(this.service.create(data));

      NotificationHelper.success('create', 'Service Area');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Service Area');
      Sentry.addBreadcrumb({
        category: 'ServiceArea',
        data: {
          ...data,
        },
        message: `Service Areas Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async update(data: IServiceArea) {
    try {
      await task(this.service.patch(data.id, data));

      NotificationHelper.success('update', 'Service Area');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Service Area');
      Sentry.addBreadcrumb({
        category: 'ServiceArea',
        data: {
          ...data,
        },
        message: `Service Areas Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async delete(id: number) {
    try {
      await task(this.service.delete(id));
      this.removeEntity(id);
      NotificationHelper.success('delete', 'Service Area');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('delete', typedError?.response?.code as ActionCode, 'Service Area');
      Sentry.addBreadcrumb({
        category: 'ServiceArea',
        data: {
          id,
        },
        message: `Service Areas Delete Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @action
  setBUItems(entities: ServiceArea[]) {
    this.buData.clear();
    entities.forEach(entry => {
      this.buData.set(+entry.id, entry);
    });
  }

  @computed
  get buValues(): ServiceArea[] {
    return Array.from(this.buData.values());
  }
}
