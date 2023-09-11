/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as Sentry from '@sentry/react';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import {
  IDisposalRatePayload,
  IDisposalRateResponse,
  IMaterialCodePayload,
  IMaterialCodeResponse,
  IRecyclingCode,
} from '@root/api/disposalSite/types';
import { disposalRateWaypointTypes } from '@root/consts';
import { convertDates, NotificationHelper } from '@root/helpers';
import { IDisposalSite } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { DisposalSiteService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { DisposalSite } from './DisposalSite';

export class DisposalSiteStore extends ConfigurationDataBaseStore<DisposalSite> {
  private readonly service: DisposalSiteService;

  @observable isMappingOpen = false;
  @observable isRatesOpen = false;

  @observable materialCodes: IMaterialCodeResponse[] = [];
  @observable disposalRates: IDisposalRateResponse[] = [];
  @observable recyclingCodes: IRecyclingCode[] = [];

  constructor(global: GlobalStore) {
    super(global, ['description']);
    this.service = new DisposalSiteService();
  }

  @computed
  get filteredValues() {
    return this.sortedValues.filter(disposalSite =>
      disposalRateWaypointTypes.includes(disposalSite.waypointType),
    );
  }

  @actionAsync
  async request({ activeOnly }: RequestQueryParams = {}) {
    this.loading = true;
    try {
      const disposalSitesResponse = await task(this.service.get({ activeOnly }));

      this.setItems(disposalSitesResponse.map(site => new DisposalSite(this, site)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'DisposalSite',
        message: `Disposal Sites Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(data: IDisposalSite) {
    //@ts-expect-error
    delete data.address.id;
    try {
      const newDisposalSite = await task(this.service.create(data));

      this.setItem(new DisposalSite(this, newDisposalSite));
      NotificationHelper.success('create', 'Disposal Site');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Disposal Site');
      Sentry.addBreadcrumb({
        category: 'DisposalSite',
        data: {
          ...data,
        },
        message: `Disposal Sites Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;
    try {
      const response = await task(this.service.getById(id));
      const disposalSite = new DisposalSite(this, response);

      this.setItem(disposalSite);
      this.selectEntity(disposalSite);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'DisposalSite',
        data: {
          id,
        },
        message: `Disposal Sites Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async update(data: IDisposalSite) {
    //@ts-expect-error
    delete data.address.id;
    try {
      this.clearPreconditionFailedError();
      const newDisposalSite = await task(this.service.update(data.id, data));

      this.setItem(new DisposalSite(this, newDisposalSite));
      NotificationHelper.success('update', 'Disposal Site');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await task(this.requestById(data.id));
      } else {
        NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Waypoint');
      }
      Sentry.addBreadcrumb({
        category: 'DisposalSite',
        data: {
          ...data,
        },
        message: `Disposal Sites Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestMaterialCodes(disposalSiteId: number, businessLineId: number) {
    this.loading = true;
    try {
      const materialCodesResponse = await task(
        this.service.requestMaterialCodes(disposalSiteId, businessLineId),
      );

      this.materialCodes = materialCodesResponse.map(convertDates);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'DisposalSite',
        data: {
          disposalSiteId,
          businessLineId,
        },
        message: `Disposal Sites Request Material Codes Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async requestDisposalRates(disposalSiteId: number, businessLineId: number) {
    this.loading = true;
    try {
      const disposalRatesResponse = await task(
        this.service.requestDisposalRates(disposalSiteId, businessLineId),
      );

      this.disposalRates = disposalRatesResponse.map(convertDates);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'DisposalSite',
        data: {
          disposalSiteId,
          businessLineId,
        },
        message: `Disposal Sites Request Rates Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async requestRecyclingCodes(businessUnitId: number, recyclingTenantName: string) {
    this.loading = true;
    try {
      const recyclingCodesResponse = await task(
        this.service.requestRecyclingCodes(businessUnitId, recyclingTenantName),
      );

      this.recyclingCodes = recyclingCodesResponse.data.materials.data;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'DisposalSite',
        data: {
          recyclingTenantName,
          businessUnitId,
        },
        message: `Disposal Sites Request Recycling Codes Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async updateMaterialMapping(id: number, data: IMaterialCodePayload[]) {
    this.loading = true;
    try {
      await task(this.service.updateMaterialMapping(id, data));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'DisposalSite',
        data: {
          id,
          ...data,
        },
        message: `Disposal Sites Update Material Codes Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async updateDisposalRates(id: number, data: IDisposalRatePayload[]) {
    this.loading = true;
    try {
      await task(this.service.updateDisposalRates(id, data));
      NotificationHelper.success('update', 'Disposal rates');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'DisposalSite',
        data: {
          id,
          ...data,
        },
        message: `Disposal Sites Update Rates Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }
  @action
  openMapping(disposalSite: DisposalSite) {
    this.isMappingOpen = true;
    this.selectEntity(disposalSite);
  }

  @action
  openRates(disposalSite: DisposalSite) {
    this.isRatesOpen = true;
    this.selectEntity(disposalSite);
  }

  @action.bound
  closeMapping() {
    this.isMappingOpen = false;
    this.materialCodes = [];
    this.recyclingCodes = [];
  }

  @action.bound
  closeRates() {
    this.isRatesOpen = false;
  }
}
