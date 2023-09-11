import * as Sentry from '@sentry/react';
import { action } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { convertDates, NotificationHelper } from '@root/helpers';
import { IBillableService, IFrequency } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { BillableItemService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { BillableService } from './BillableService';
import { RequestFrequenciesOptions, RequestOptions } from './types';

export class BillableServiceStore extends ConfigurationDataBaseStore<BillableService> {
  private readonly service: BillableItemService;
  frequencies: IFrequency[] = [];
  filteredServices: BillableService[] = [];

  constructor(global: GlobalStore) {
    super(global, ['description']);
    this.service = new BillableItemService();
  }

  @actionAsync
  async request(
    {
      businessLineId,
      businessLineIds,
      oneTime,
      activeOnly,
      populateIncluded,
      billingCycle,
      equipmentItemIds,
    }: RequestOptions,
    skipEquipmentLoading = false,
  ) {
    this.loading = true;

    let billableServices;

    const loadEquipment = () =>
      skipEquipmentLoading
        ? Promise.resolve()
        : this.globalStore.equipmentItemStore.request({ businessLineId });

    try {
      const [billableItemsResponse] = await task(
        Promise.all([
          this.service.get({
            businessLineId,
            businessLineIds,
            oneTime,
            activeOnly,
            populateIncluded,
            billingCycle,
            equipmentItemIds,
          }),
          loadEquipment(),
        ]),
      );

      billableServices = billableItemsResponse.map(service => new BillableService(this, service));
      this.setItems(billableServices);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BillableService',
        data: {
          businessLineId,
          businessLineIds,
          oneTime,
          activeOnly,
          populateIncluded,
          billingCycle,
        },
        message: `BillableServices Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;

    return billableServices;
  }

  @actionAsync
  async create(entity: IBillableService) {
    try {
      const newEntity = await task(
        this.service.create({
          ...entity,
          importCodes: entity.importCodes ?? null,
        }),
      );

      this.setItem(new BillableService(this, newEntity));
      NotificationHelper.success('create', 'Billable Service');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'create',
        typedError?.response?.code as ActionCode,
        'Billable Service',
      );
      Sentry.addBreadcrumb({
        category: 'BillableService',
        data: {
          ...entity,
        },
        message: `BillableServices Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;
    try {
      const response = await task(this.service.getById(id));
      const billableService = new BillableService(this, response);

      this.setItem(billableService);
      this.selectEntity(billableService);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BillableService',
        data: {
          id,
        },
        message: `BillableServices Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async requestHistoricalById(originalId: number) {
    this.loading = true;
    try {
      const billableService = await task(this.service.getHistoricalById(originalId));
      return billableService;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BillableService',
        data: {
          originalId,
        },
        message: `BillableServicesHistorical Request By Id Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async update(entity: IBillableService) {
    try {
      this.clearPreconditionFailedError();
      const newEntity = await task(this.service.update(entity.id, entity));

      this.setItem(new BillableService(this, newEntity));
      NotificationHelper.success('update', 'Billable Service');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await this.requestById(entity.id);
      }
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'BillableService',
      );
      Sentry.addBreadcrumb({
        category: 'BillableService',
        data: {
          ...entity,
        },
        message: `BillableServices Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestFrequencies(billableServiceId: number, options?: RequestFrequenciesOptions) {
    try {
      const rawFrequencies = await task(
        this.service.getFrequencies(billableServiceId, { ...options }),
      );

      this.frequencies = rawFrequencies.map(convertDates);

      return this.frequencies;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BillableService',
        data: {
          billableServiceId,
          ...options,
        },
        message: `BillableServices Request Frequencies Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestFrequenciesBatch(billableServiceId: number, options: RequestFrequenciesOptions) {
    try {
      const rawFrequencies = await task(this.service.getFrequencies(billableServiceId, options));

      this.frequencies = rawFrequencies.map(convertDates);

      return this.frequencies;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BillableService',
        data: {
          billableServiceId,
          ...options,
        },
        message: `BillableServices Request Frequencies Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestServicesByFrequencyId(options: {
    businessLineId: string;
    oneTime: boolean;
    frequencies: (number | null)[];
  }) {
    const { businessLineId, oneTime, frequencies } = options;

    this.loading = true;
    try {
      const filteredFrequencies = frequencies.filter(id => !!id) as number[];
      const frequencyIds = filteredFrequencies.map(id => `frequencyIds=${id}`).join('&');
      const billableItemsResponse = await task(
        this.service.getFrequenciesByService(
          `businessLineId=${businessLineId}&oneTime=${String(oneTime)}${
            frequencyIds ? `&${frequencyIds}&frequencyIds=null` : ''
          }`,
        ),
      );

      this.filteredServices = billableItemsResponse.map(
        service => new BillableService(this, service),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BillableService',
        data: {
          ...options,
        },
        message: `BillableServices Request By Frequency Id ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @action
  cleanFilteredServices() {
    this.filteredServices = [];
  }
}
