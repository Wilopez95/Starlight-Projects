import * as Sentry from '@sentry/react';
import { camelCase } from 'lodash-es';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { ApiError } from '@root/api/base/ApiError';
import { convertDates, NotificationHelper } from '@root/helpers';
import { ILinkedPriceGroupsData } from '@root/modules/pricing/CustomRate/components/quickViews/CustomRateBulkEditQuickView/types';
import { ConfigurationDataBaseStore } from '@root/stores/base/ConfigurationDataBaseStore';
import GlobalStore from '@root/stores/GlobalStore';
import { IBusinessContextIds } from '@root/types/base/businessContext';

import { ActionCode } from '@root/helpers/notifications/types';
import { IPriceGroup } from '../../types';
import { PriceGroupService } from '../api/priceGroup';
import {
  billableItemTypes,
  IBulkRatesEditedPayload,
  IBulkRatesPreviewPayload,
  IGroupedPriceGroupsList,
  IRequestSpecificOptions,
  IUpdateThresholdsRequest,
  PriceGroupRequest,
} from '../api/types';

import { PriceGroup } from './PriceGroup';

export class PriceGroupStoreNew extends ConfigurationDataBaseStore<PriceGroup> {
  private readonly service: PriceGroupService;

  @observable isOpenBulkEditQuickView = false;
  @observable linkedPriceGroups: ILinkedPriceGroupsData | null = null;
  @observable pricingUpdatesPreview: IGroupedPriceGroupsList = {};

  constructor(global: GlobalStore) {
    super(global, ['description']);
    this.service = new PriceGroupService();
  }

  @computed
  get noResult() {
    return !this.loading && this.values.length === 0;
  }

  @action.bound
  toggleBulkEditQuickView(value?: boolean): void {
    if (typeof value === 'undefined') {
      this.isOpenBulkEditQuickView = !this.isOpenBulkEditQuickView;

      return;
    }
    this.isOpenBulkEditQuickView = value;
  }

  @actionAsync
  async request(params: PriceGroupRequest) {
    this.loading = true;

    try {
      const priceGroupsResponse = await task(
        this.service.get({
          ...params,
          limit: this.limit,
          skip: this.offset,
        }),
      );

      this.validateLoading(priceGroupsResponse, this.limit);

      this.setItems(priceGroupsResponse.map(priceGroup => new PriceGroup(this, priceGroup)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          ...params,
        },
        message: `Price Groups Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.offset += this.limit;

    this.loading = false;
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;
    try {
      const response = await task(this.service.getById(id));
      const priceGroup = new PriceGroup(this, response);

      this.setItem(priceGroup);

      this.selectEntity(priceGroup);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          id,
        },
        message: `Price Groups Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async requestSpecific(params: IRequestSpecificOptions) {
    this.loading = true;

    try {
      const priceGroupsResponse = await task(
        this.service.requestSpecific({ ...params, limit: this.limit, skip: this.offset }),
      );

      this.validateLoading(priceGroupsResponse, this.limit);

      this.setItems(priceGroupsResponse.map(priceGroup => new PriceGroup(this, priceGroup)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          ...params,
        },
        message: `Price Groups Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async create(entity: IPriceGroup) {
    try {
      const createdEntity = await task(this.service.create(entity));

      const priceGroup = new PriceGroup(this, createdEntity);

      this.setItem(priceGroup);

      NotificationHelper.success('create', 'Price Group');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Price Group');
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          ...entity,
        },
        message: `Price Groups Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async update(entity: IPriceGroup) {
    try {
      this.clearPreconditionFailedError();
      const updatedEntity = await task(this.service.update(entity.id, entity));

      const priceGroup = new PriceGroup(this, updatedEntity);

      this.setItem(priceGroup);

      this.selectEntity(priceGroup);

      NotificationHelper.success('update', 'Price Group');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);

      if (this.isPreconditionFailed) {
        await task(this.requestById(entity.id));
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      }

      NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Price Group');
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          ...entity,
        },
        message: `Price Groups Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async duplicate(priceGroupId: number, data: IPriceGroup) {
    this.loading = true;

    try {
      const response = await task(this.service.duplicate(priceGroupId, data));

      // if (!data.businessUnitId) {
      //   await task(this.requestById(response.id));
      //   NotificationHelper.success('duplicatePriceGroup');
      // } else {
      //   const businessUnit = this.globalStore.businessUnitStore.getById(data.businessUnitId);
      //   const businessLine = businessUnit?.businessLines.find((i) => i.id === +data.businessLineId);

      this.setItem(new PriceGroup(this, response));
      NotificationHelper.success('duplicatePriceGroup');

      // NotificationHelper.successWithLink(
      //   {
      //     uri: pathToUrl(Paths.BusinessUnitConfigurationModule.PriceGroups, {
      //       businessLine: data.businessLineId,
      //       businessUnit: data.businessUnitId,
      //     }),

      //     label: `${businessUnit?.nameLine1 || ''}, ${businessLine?.name || ''}`,
      //   },
      //   'duplicatePriceGroupToAnotherBu',
      // );
      // }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('duplicatePriceGroup', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          priceGroupId,
          ...data,
        },
        message: `Price Groups Duplicate Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async updateThresholdSetting(thresholds: IUpdateThresholdsRequest, priceGroupId: number) {
    try {
      const updatedPriceGroup = await task(
        this.service.updateThresholdSetting(thresholds, priceGroupId),
      );

      this.setItem(new PriceGroup(this, updatedPriceGroup));

      NotificationHelper.success('update', 'Threshold setting');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Threshold setting',
      );
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          priceGroupId,
          thresholds,
        },
        message: `Price Groups Update Thresholds Settings Rate Error ${JSON.stringify(
          typedError.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async updateBatch(data: IBulkRatesEditedPayload) {
    try {
      await task(this.service.updateBatch(data));

      NotificationHelper.success('update', 'Batch Rates');

      return false;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      if (error instanceof ApiError && error.statusCode === 409) {
        return true;
      }

      NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Batch Rates');
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          ...data,
        },
        message: `Price Groups Update Batch Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestPreview(data: IBulkRatesPreviewPayload) {
    try {
      const pricingPreviewResponse = await task(this.service.requestPreview(data));

      this.pricingUpdatesPreview =
        pricingPreviewResponse.previewPrices.reduce<IGroupedPriceGroupsList>((agg, priceGroup) => {
          const preparedPriceGroup = convertDates(priceGroup);
          const key = camelCase(preparedPriceGroup.entityType);
          const currentList = agg[key as billableItemTypes] ?? [];

          return { ...agg, [key]: [...currentList, preparedPriceGroup] };
        }, {});
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.pricingUpdatesPreview = {};
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          ...data,
        },
        message: `Price Groups Request Targeted Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestLinked(params: IBusinessContextIds) {
    try {
      const linkedPriceGroupsResponse = await task(this.service.requestLinked(params));

      this.linkedPriceGroups = {
        customers: linkedPriceGroupsResponse.customers.map(convertDates),
        customerJobSites: linkedPriceGroupsResponse.customerJobSites.map(convertDates),
        customerGroups: linkedPriceGroupsResponse.customerGroups.map(convertDates),
        serviceAreas: linkedPriceGroupsResponse.serviceAreas.map(convertDates),
      };
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          ...params,
        },
        message: `Linked Price Groups Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }
}
