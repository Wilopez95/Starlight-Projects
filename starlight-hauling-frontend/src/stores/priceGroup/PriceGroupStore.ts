import * as Sentry from '@sentry/react';
import { startOfDay } from 'date-fns';
import { action, computed, observable } from 'mobx';
import { actionAsync, createTransformer, task } from 'mobx-utils';

import {
  IBulkRatesEditTargetedPriceGroup,
  IPriceGroupLineItemRequest,
  IPriceGroupServiceRequest,
  IPriceGroupSurchargeRequest,
  IPriceGroupThresholdRequest,
  IRatesHistoryRequest,
} from '@root/api/priceGroup/types';
import { Paths } from '@root/consts';
import {
  convertDates,
  NotificationHelper,
  parseDate,
  pathToUrl,
  substituteLocalTimeZoneInsteadUTC,
} from '@root/helpers';
import { IBulkRatesEditData } from '@root/pages/SystemConfiguration/tables/PriceGroups/QuickView/BulkRatesEdit/types';
import {
  IPriceGroup,
  IPriceGroupRateLineItem,
  IPriceGroupRateService,
  IPriceGroupRateSurcharge,
  IPriceGroupRateThreshold,
  IRatesHistoryItem,
} from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { PriceGroupService } from '../../api';
import { BaseStore } from '../base/BaseStore';
import type GlobalStore from '../GlobalStore';

import { PriceGroup } from './PriceGroup';
import { sanitizeServiceRates } from './sanitize';
import {
  IRequestPriceGroupsOptions,
  IRequestSpecificOptions,
  ITargetedPriceGroups,
  IUpdateThresholdsRequest,
  PriceGroupSortType,
} from './types';

export class PriceGroupStore extends BaseStore<PriceGroup, PriceGroupSortType> {
  private readonly service: PriceGroupService;
  private priceGroupType?: string;

  @observable isOpenRatesQuickView = false;
  @observable isOpenBulkEditQuickView = false;

  @observable services: IPriceGroupRateService[] = [];
  @observable lineItems: IPriceGroupRateLineItem[] = [];
  @observable thresholds: IPriceGroupRateThreshold[] = [];
  @observable surcharges: IPriceGroupRateSurcharge[] = [];

  @observable targetedPriceGroups: ITargetedPriceGroups[] = [];

  @observable rateHistoryData: IRatesHistoryItem[] = [];

  @observable servicesLoading = true;
  @observable lineItemsLoading = true;
  @observable thresholdsLoading = true;
  @observable surchargesLoading = true;
  @observable historyLoading = false;

  constructor(global: GlobalStore) {
    super(global, 'startDate', 'desc');
    this.service = new PriceGroupService();
  }

  @computed
  get noResult() {
    return !this.loading && this.values.length === 0;
  }

  @computed
  get priceGroupService() {
    return createTransformer((id: number) =>
      this.services.find(service => service.billableServiceId === id),
    );
  }

  @computed
  get priceGroupLineItem() {
    return createTransformer((id: number) =>
      this.lineItems.find(lineItem => lineItem.lineItemId === id),
    );
  }

  @computed
  get priceGroupSurcharge() {
    return createTransformer((id: number) =>
      this.surcharges.find(surcharge => surcharge.surchargeId === id),
    );
  }

  @computed
  get priceGroupThreshold() {
    return createTransformer((id: number) =>
      this.thresholds.find(threshold => threshold.thresholdId === id),
    );
  }

  @action toggleRatesQuickView(value?: boolean): void {
    if (typeof value === 'undefined') {
      this.isOpenRatesQuickView = !this.isOpenRatesQuickView;

      return;
    }
    this.isOpenRatesQuickView = value;
  }

  @action.bound toggleBulkEditQuickView(value?: boolean): void {
    if (typeof value === 'undefined') {
      this.isOpenBulkEditQuickView = !this.isOpenBulkEditQuickView;

      return;
    }
    this.isOpenBulkEditQuickView = value;
  }

  @actionAsync
  async request({ businessLineId, businessUnitId, type }: IRequestPriceGroupsOptions) {
    this.loading = true;

    try {
      this.priceGroupType = type;
      const priceGroupsResponse = await task(
        this.service.get({
          businessUnitId,
          businessLineId,
          limit: this.limit,
          skip: this.offset,
          activeOnly: !this.globalStore.systemConfigurationStore.showInactive,
          type,
        }),
      );

      this.validateLoading(priceGroupsResponse, this.limit);

      if (this.priceGroupType === type) {
        this.setItems(priceGroupsResponse.map(priceGroup => new PriceGroup(this, priceGroup)));
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          businessLineId,
          businessUnitId,
          type,
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
        this.service.requestSpecific({
          ...params,
          limit: this.limit,
          skip: this.offset,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
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
      } else {
        NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Price Group');
      }
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

      if (!data.businessUnitId) {
        await task(this.requestById(response.id));
        NotificationHelper.success('duplicatePriceGroup');
      } else {
        const businessUnit = this.globalStore.businessUnitStore.getById(data.businessUnitId);
        const businessLine = businessUnit?.businessLines.find(i => i.id === +data.businessLineId);

        this.setItem(new PriceGroup(this, response));

        NotificationHelper.successWithLink(
          {
            uri: pathToUrl(Paths.BusinessUnitConfigurationModule.PriceGroups, {
              businessLine: data.businessLineId,
              businessUnit: data.businessUnitId,
            }),

            label: `${businessUnit?.nameLine1 ?? ''}, ${businessLine?.name ?? ''}`,
          },
          'duplicatePriceGroupToAnotherBu',
        );
      }
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
  async requestServices({
    businessUnitId,
    businessLineId,
    priceGroupId,
    materialId,
    equipmentItemId,
    billableServiceId,
  }: IPriceGroupServiceRequest) {
    this.servicesLoading = true;
    this.services = [];
    try {
      const serviceResponse = await task(
        this.service.requestServices({
          businessUnitId,
          businessLineId,
          priceGroupId,
          materialId,
          equipmentItemId,
          billableServiceId,
        }),
      );

      const services = serviceResponse.map(service => {
        const effectiveDate = service.effectiveDate ? parseDate(service.effectiveDate) : null;

        return { ...service, effectiveDate };
      });

      this.services = services as IPriceGroupRateService[];
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          businessUnitId,
          businessLineId,
          priceGroupId,
          materialId,
          equipmentItemId,
          billableServiceId,
        },
        message: `Price Groups Request Services Rate Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.servicesLoading = false;

    return this.services;
  }

  @actionAsync
  async requestLineItems({
    businessUnitId,
    businessLineId,
    priceGroupId,
    lineItemId,
    materialId,
  }: IPriceGroupLineItemRequest) {
    this.lineItemsLoading = true;
    try {
      const lineItemResponse = await task(
        this.service.requestLineItems({
          businessUnitId,
          businessLineId,
          priceGroupId,
          lineItemId,
          materialId,
        }),
      );

      const lineItems = lineItemResponse.map(lineItem => {
        const effectiveDate = lineItem.effectiveDate
          ? startOfDay(substituteLocalTimeZoneInsteadUTC(lineItem.effectiveDate))
          : null;

        return { ...lineItem, effectiveDate };
      });

      this.lineItems = lineItems as IPriceGroupRateLineItem[];
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          businessUnitId,
          businessLineId,
          priceGroupId,
          lineItemId,
          materialId,
        },
        message: `Price Groups Request Line Items Rate Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }
    this.lineItemsLoading = false;

    return this.lineItems;
  }

  @actionAsync
  async requestSurcharges({
    businessUnitId,
    businessLineId,
    priceGroupId,
    surchargeId,
    materialId,
  }: IPriceGroupSurchargeRequest) {
    this.surchargesLoading = true;
    try {
      const surchargeResponse = await task(
        this.service.requestSurcharges({
          businessUnitId,
          businessLineId,
          priceGroupId,
          surchargeId,
          materialId,
        }),
      );

      this.surcharges = surchargeResponse as IPriceGroupRateSurcharge[];
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          businessUnitId,
          businessLineId,
          priceGroupId,
          surchargeId,
          materialId,
        },
        message: `Price Groups Request Surcharges Rate Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }
    this.surchargesLoading = false;
  }

  @actionAsync
  async requestThresholds({
    businessUnitId,
    businessLineId,
    priceGroupId,
    thresholdId,
    materialId,
    equipmentItemId,
  }: IPriceGroupThresholdRequest) {
    this.thresholdsLoading = true;
    try {
      const thresholdsResponse = await task(
        this.service.requestThresholds({
          businessUnitId,
          businessLineId,
          thresholdId,
          materialId,
          equipmentItemId,
          priceGroupId,
        }),
      );

      this.thresholds = thresholdsResponse as IPriceGroupRateThreshold[];
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          businessUnitId,
          businessLineId,
          priceGroupId,
          thresholdId,
          materialId,
          equipmentItemId,
        },
        message: `Price Groups Request Thresholds Rate Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }
    this.thresholdsLoading = false;
  }

  @actionAsync
  async requestRatesHistory(ratesHistoryParams: IRatesHistoryRequest) {
    if (this.historyLoading) {
      return;
    }

    this.historyLoading = true;
    try {
      this.rateHistoryData = [];
      const historyItems = await task(this.service.requestRatesHistory(ratesHistoryParams));

      this.rateHistoryData = historyItems.map(item =>
        Object.assign(item, { timestamp: parseDate(item.timestamp) }),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          ...ratesHistoryParams,
        },
        message: `Price Groups Request Rates History Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.historyLoading = false;
  }

  @actionAsync
  async updateServices(data: IPriceGroupRateService[], priceGroupId: number) {
    try {
      this.clearPreconditionFailedError();
      await task(this.service.updateServices(sanitizeServiceRates(data), priceGroupId));

      NotificationHelper.success('update', 'Rates for billable services');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Rates for billable services',
      );
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          priceGroupId,
          ...data,
        },
        message: `Price Groups Update Services Rate Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async updateLineItems(data: IPriceGroupRateLineItem[], priceGroupId: number) {
    try {
      this.clearPreconditionFailedError();
      await task(this.service.updateLineItems(data, priceGroupId));

      NotificationHelper.success('update', 'Rates for billable line items');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Rates for billable line items',
      );
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          priceGroupId,
          ...data,
        },
        message: `Price Groups Update Line Items Rate Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async updateSurcharges(data: IPriceGroupRateSurcharge[], priceGroupId: number) {
    try {
      this.clearPreconditionFailedError();
      await task(this.service.updateSurcharges(data, priceGroupId));

      NotificationHelper.success('update', 'Rates for billable surcharges');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Rates for billable surcharges',
      );
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          priceGroupId,
          ...data,
        },
        message: `Price Groups Update Surcharges Rate Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async updateThresholds(data: IPriceGroupRateThreshold[], priceGroupId: number) {
    try {
      this.clearPreconditionFailedError();
      await task(this.service.updateThresholds(data, priceGroupId));

      NotificationHelper.success('update', 'Rates for thresholds');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Rates for thresholds',
      );
      Sentry.addBreadcrumb({
        category: 'PriceGroup',
        data: {
          priceGroupId,
          ...data,
        },
        message: `Price Groups Update Thresholds Rate Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
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
  async checkPendingUpdates(data: IBulkRatesEditData) {
    try {
      const result = await task(this.service.updateBatch(data));

      if (result?.isPendingUpdates) {
        return true;
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
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

    return false;
  }

  @actionAsync
  async updateBatch(data: IBulkRatesEditData) {
    try {
      await task(this.service.updateBatch(data));

      NotificationHelper.success('update', 'Batch Rates');
    } catch (error: unknown) {
      const typedError = error as ApiError;
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
  async requestTargetedRateGroups(data: IBulkRatesEditTargetedPriceGroup) {
    try {
      const priceGroupsResponse = await task(this.service.fetchTargetedRateGroups(data));

      this.targetedPriceGroups = priceGroupsResponse.map(priceGroup => convertDates(priceGroup));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.targetedPriceGroups = [];
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
}
