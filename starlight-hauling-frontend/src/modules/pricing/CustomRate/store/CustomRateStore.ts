import * as Sentry from '@sentry/react';
import { filter, find } from 'lodash-es';
import { action, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { convertDates, NotificationHelper } from '@root/helpers';
import { BaseEntity } from '@root/stores/base/BaseEntity';
import { BaseStore } from '@root/stores/base/BaseStore';
import GlobalStore from '@root/stores/GlobalStore';
import { ThresholdSettingsType } from '@root/types';
import { IBusinessContextIds } from '@root/types/base/businessContext';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { IRatesFilterParameters } from '../../types';
import { CustomRateService } from '../api/customRate';
import { ICustomRatePayload, ICustomRateRequestParams } from '../api/types';
import { sanitizeRates } from '../helpers';

export class CustomRateStoreNew extends BaseStore<BaseEntity> {
  private readonly service: CustomRateService;

  @observable isOpenRatesQuickView = false;
  @observable rates: ICustomRatePayload;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new CustomRateService();
    this.loading = false;
    this.rates = {
      oneTimeLineItem: null,
      oneTimeService: null,
      recurringLineItem: null,
      recurringService: null,
      surcharge: null,
      threshold: null,
    };
  }

  @actionAsync
  async request(data: ICustomRateRequestParams) {
    this.loading = true;
    try {
      const requestResponse = await task(this.service.request(data));

      this.rates = {
        oneTimeService: requestResponse.oneTimeService ?? null,
        recurringService:
          requestResponse.recurringService?.map(recurringService => ({
            ...recurringService,
            frequencies: recurringService.frequencies
              ? recurringService.frequencies.map(convertDates)
              : undefined,
          })) ?? null,
        oneTimeLineItem: requestResponse.oneTimeLineItem ?? null,
        recurringLineItem: requestResponse.recurringLineItem ?? null,
        surcharge: requestResponse.surcharge ?? null,
        threshold: requestResponse.threshold ?? null,
      };
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'GeneralRate',
        data: {
          ...data,
        },
        message: `General Rates Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.loading = false;
  }

  @actionAsync
  async update(data: Partial<ICustomRatePayload> & IBusinessContextIds & { id: number }) {
    try {
      await task(this.service.update(sanitizeRates(data)));
      NotificationHelper.success('update', 'General Rack Rates');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'General Rack Rates',
      );
      Sentry.addBreadcrumb({
        category: 'GeneralRate',
        data: {
          ...data,
        },
        message: `General Rates Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async updateThresholdSetting(
    data: { setting: ThresholdSettingsType; thresholdId: number } & IBusinessContextIds,
  ) {
    try {
      this.clearPreconditionFailedError();
      await task(this.service.updateThresholdSetting(data));
      NotificationHelper.success('update', 'General Rate Thresholds Setting');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      }
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'General Rate Thresholds Setting',
      );
      Sentry.addBreadcrumb({
        category: 'GeneralRate',
        data: {
          ...data,
        },
        message: `General Rates Update Threshold Settings Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestThresholdSetting(data: IBusinessContextIds & { thresholdId: number }) {
    try {
      this.clearPreconditionFailedError();
      const setting = await task(this.service.requestThresholdSetting(data));

      return setting;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'GeneralRate',
        data: {
          ...data,
        },
        message: `General Rates Request Thresholds Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @action toggleRatesQuickView(value?: boolean): void {
    if (typeof value === 'undefined') {
      this.isOpenRatesQuickView = !this.isOpenRatesQuickView;

      return;
    }
    this.isOpenRatesQuickView = value;
  }

  getRecurrentServiceByBillableServiceId(billableServiceId: number) {
    return find(this.rates.recurringService, { billableServiceId });
  }

  getOneTimeServiceByBillableServiceId(billableServiceId: number) {
    return find(this.rates.oneTimeService, { billableServiceId });
  }

  @action
  filterOneTimeServiceRatesByParameters(params?: IRatesFilterParameters) {
    this.rates.oneTimeService = filter(this.rates.oneTimeService, { ...params });
  }

  @action
  filterRecurrentServiceRatesByParameters(params?: IRatesFilterParameters) {
    this.rates.recurringService = filter(this.rates.recurringService, { ...params });
  }

  @action
  filterOneTimeLineItemRatesByParameters(params?: IRatesFilterParameters) {
    this.rates.oneTimeLineItem = filter(this.rates.oneTimeLineItem, { ...params });
  }

  @action
  filterRecurrentLineItemRatesByParameters(params?: IRatesFilterParameters) {
    this.rates.recurringLineItem = filter(this.rates.recurringLineItem, { ...params });
  }

  @action
  filterSurchargeRatesByParameters(params?: IRatesFilterParameters) {
    this.rates.surcharge = filter(this.rates.surcharge, { ...params });
  }

  @action
  filterThresholdRatesByParameters(params?: IRatesFilterParameters) {
    this.rates.threshold = filter(this.rates.threshold, { ...params });
  }
}
