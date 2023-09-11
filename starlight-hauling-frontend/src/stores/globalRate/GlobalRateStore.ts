import * as Sentry from '@sentry/react';
import { find } from 'lodash-es';
import { observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import {
  IGlobalRatesServiceRequest,
  IGlobalRatesThresholdRequest,
} from '@root/api/globalRate/types';
import { convertDates, NotificationHelper } from '@root/helpers';
import {
  IGlobalRateLineItem,
  IGlobalRateRecurringLineItem,
  IGlobalRateRecurringService,
  IGlobalRateService,
  IGlobalRateSurcharge,
  IGlobalRateThreshold,
  ThresholdSettingsType,
} from '@root/types';
import { IBusinessContextIds } from '@root/types/base/businessContext';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { GlobalRateService } from '../../api';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { GlobalRate } from './GlobalRate';
import { sanitizeServiceRates } from './sanitize';

export class GlobalRateStore extends BaseStore<GlobalRate> {
  private readonly service: GlobalRateService;

  @observable services: IGlobalRateService[] = [];
  @observable recurringServices: IGlobalRateRecurringService[] = [];
  @observable lineItems: IGlobalRateLineItem[] = [];
  @observable recurringLineItems: IGlobalRateRecurringLineItem[] = [];
  @observable thresholds: IGlobalRateThreshold[] = [];
  @observable surcharges: IGlobalRateSurcharge[] = [];

  @observable servicesLoading = true;
  @observable recurringServicesLoading = true;
  @observable lineItemsLoading = true;
  @observable recurringLineItemsLoading = true;
  @observable thresholdsLoading = true;
  @observable surchargesLoading = true;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new GlobalRateService();
    this.setItem(new GlobalRate());
    this.loading = false;
  }

  getRecurrentServiceByBillableServiceId(billableServiceId: number) {
    return find(this.recurringServices, ['billableServiceId', billableServiceId]);
  }

  @actionAsync
  async requestServices({
    businessUnitId,
    businessLineId,
    materialId,
    equipmentItemId,
    billableServiceId,
  }: IGlobalRatesServiceRequest) {
    this.servicesLoading = true;
    try {
      const serviceResponse = await task(
        this.service.requestServices({
          businessUnitId,
          businessLineId,
          materialId,
          equipmentItemId,
          billableServiceId,
        }),
      );

      this.services = serviceResponse.map(convertDates);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'GlobalRate',
        data: {
          businessUnitId,
          businessLineId,
          materialId,
          equipmentItemId,
          billableServiceId,
        },
        message: `General Rates Services Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.servicesLoading = false;
  }

  @actionAsync
  async requestRecurringServices({
    businessUnitId,
    businessLineId,
    materialId,
    equipmentItemId,
    billableServiceId,
  }: IGlobalRatesServiceRequest) {
    this.recurringServicesLoading = true;
    try {
      const serviceResponse = await task(
        this.service.requestRecurringServices({
          businessUnitId,
          businessLineId,
          materialId,
          equipmentItemId,
          billableServiceId,
        }),
      );

      const recurringServices = serviceResponse.map(convertDates) as IGlobalRateRecurringService[];

      this.recurringServices = recurringServices;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'GlobalRate',
        data: {
          businessUnitId,
          businessLineId,
          materialId,
          equipmentItemId,
          billableServiceId,
        },
        message: `General Rates Recurring Services Request Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }
    this.recurringServicesLoading = false;

    return this.recurringServices;
  }

  @actionAsync
  async requestLineItems({
    businessUnitId,
    businessLineId,
    lineItemId,
    materialId,
  }: { lineItemId?: number; materialId?: number | null } & IBusinessContextIds) {
    this.lineItemsLoading = true;
    try {
      const lineItemResponse = await task(
        this.service.requestLineItems({ businessUnitId, businessLineId, lineItemId, materialId }),
      );

      this.lineItems = lineItemResponse.map(convertDates);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'GlobalRate',
        data: {
          businessUnitId,
          businessLineId,
          lineItemId,
          materialId,
        },
        message: `General Rates Line Items Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.lineItemsLoading = false;
  }

  @actionAsync
  async requestSurcharges({
    businessUnitId,
    businessLineId,
    surchargeId,
    materialId,
  }: { surchargeId?: number; materialId?: number } & IBusinessContextIds) {
    this.surchargesLoading = true;
    try {
      const surchargeResponse = await task(
        this.service.requestSurcharges({ businessUnitId, businessLineId, surchargeId, materialId }),
      );

      this.surcharges = surchargeResponse.map(convertDates);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'GlobalRate',
        data: {
          businessUnitId,
          businessLineId,
          surchargeId,
          materialId,
        },
        message: `General Rates Surcharges Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.surchargesLoading = false;
  }

  @actionAsync
  async requestRecurringLineItems({
    businessUnitId,
    businessLineId,
    lineItemId,
  }: { lineItemId?: number } & IBusinessContextIds) {
    this.recurringLineItemsLoading = true;
    try {
      const lineItemResponse = await task(
        this.service.requestRecurringLineItems({ businessUnitId, businessLineId, lineItemId }),
      );

      this.recurringLineItems = lineItemResponse.map(convertDates);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'GlobalRate',
        data: {
          businessUnitId,
          businessLineId,
          lineItemId,
        },
        message: `General Rates Recurring Line Items Request Error ${JSON.stringify(
          typedError.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }
    this.recurringLineItemsLoading = false;
  }

  @actionAsync
  async requestThresholds({
    businessUnitId,
    businessLineId,
    thresholdId,
    materialId,
    equipmentItemId,
  }: IGlobalRatesThresholdRequest) {
    this.thresholdsLoading = true;
    try {
      const thresholdsResponse = await task(
        this.service.requestThresholds({
          businessUnitId,
          businessLineId,
          thresholdId,
          materialId,
          equipmentItemId,
        }),
      );

      this.thresholds = thresholdsResponse.map(convertDates);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'GlobalRate',
        data: {
          businessUnitId,
          businessLineId,
          thresholdId,
          materialId,
          equipmentItemId,
        },
        message: `General Rates Thresholds Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.thresholdsLoading = false;
  }

  @actionAsync
  async updateServices(data: IGlobalRateService[]) {
    try {
      this.clearPreconditionFailedError();
      await task(this.service.updateService(sanitizeServiceRates(data)));
      NotificationHelper.success('update', 'Services General Rack Rates');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      }
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Services General Rack Rates',
      );
      Sentry.addBreadcrumb({
        category: 'GlobalRate',
        data: {
          ...data,
        },
        message: `General Rates Update Services Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async updateRecurringServices(data: IGlobalRateRecurringService[]) {
    try {
      this.clearPreconditionFailedError();
      const dataToUpdate = data.map(globalRate => {
        if (!globalRate.price) {
          delete globalRate.price;
        }

        return globalRate;
      });

      await task(this.service.updateRecurringService(dataToUpdate));
      NotificationHelper.success('update', 'Recurring Services General Rack Rates');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      }
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Recurring Services General Rack Rates',
      );
      Sentry.addBreadcrumb({
        category: 'GlobalRate',
        data: {
          ...data,
        },
        message: `General Rates Update Recurring Services Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async updateLineItems(data: IGlobalRateLineItem[]) {
    try {
      this.clearPreconditionFailedError();
      await task(this.service.updateLineItem(data));
      NotificationHelper.success('update', 'Line Items General Rack Rates');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      }
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Line Items General Rack Rates',
      );
      Sentry.addBreadcrumb({
        category: 'GlobalRate',
        data: {
          ...data,
        },
        message: `General Rates Update Line Items Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async updateSurcharges(data: IGlobalRateSurcharge[]) {
    try {
      this.clearPreconditionFailedError();
      await task(this.service.updateSurcharge(data));
      NotificationHelper.success('update', 'Surcharges General Rack Rates');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      }
      NotificationHelper.success(
        'update',
        typedError?.response?.code,
        'Surcharges General Rack Rates',
      );
      Sentry.addBreadcrumb({
        category: 'GlobalRate',
        data: {
          ...data,
        },
        message: `General Rates Update Surcharges Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async updateRecurringLineItems(data: IGlobalRateRecurringLineItem[]) {
    try {
      this.clearPreconditionFailedError();
      const dataToUpdate = data.map(globalRate => {
        if (!globalRate.price) {
          delete globalRate.price;
        }

        return globalRate;
      });

      await task(this.service.updateRecurringLineItem(dataToUpdate));
      NotificationHelper.success('update', 'Recurring Line Items General Rack Rates');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      }
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Recurring Line Items General Rack Rates',
      );
      Sentry.addBreadcrumb({
        category: 'GlobalRate',
        data: {
          ...data,
        },
        message: `General Rates Update Recurring Line Items Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async updateThresholds(data: IGlobalRateThreshold[]) {
    try {
      this.clearPreconditionFailedError();
      await task(this.service.updateThresholds(data));
      NotificationHelper.success('update', 'Thresholds General Rack Rates');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      }
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Thresholds General Rack Rates',
      );
      Sentry.addBreadcrumb({
        category: 'GlobalRate',
        data: {
          ...data,
        },
        message: `General Rates Update Thresholds Error ${JSON.stringify(typedError?.message)}`,
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
        category: 'GlobalRate',
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
        category: 'GlobalRate',
        data: {
          ...data,
        },
        message: `General Rates Request Thresholds Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }
}
