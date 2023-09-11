import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import { BusinessLineType } from '@root/consts';
import { NotificationHelper } from '@root/helpers';
import { IBusinessLine } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { BusinessLineService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { BusinessLine } from './BusinessLine';

export class BusinessLineStore extends ConfigurationDataBaseStore<BusinessLine> {
  private readonly service: BusinessLineService;

  constructor(global: GlobalStore) {
    super(global, ['id']);
    this.service = new BusinessLineService();
  }

  @actionAsync
  async request(params: RequestQueryParams = {}) {
    this.loading = true;
    try {
      const businessLines = await task(this.service.get(params));
      const items = businessLines.map(businessLine => new BusinessLine(this, businessLine));
      this.setItems(items);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BusinessLine',
        message: `BusinessLines Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async getBLByBUId(businessUnitId: number, options: RequestQueryParams) {
    this.loading = true;
    try {
      const businessLines = await task(
        this.service.getBusinessLinesByBUId(businessUnitId, options),
      );
      const items = businessLines.map(businessLine => new BusinessLine(this, businessLine));

      this.setItems(items);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BusinessLine',
        data: {
          businessUnitId,
          ...options,
        },
        message: `BusinessLines Request By BU Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(data: IBusinessLine) {
    this.loading = true;
    try {
      const businessLine = await task(this.service.create(data));

      const entity = new BusinessLine(this, businessLine);

      this.setItem(entity);
      this.loading = false;
      NotificationHelper.success('create', 'Business Line');

      return entity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Business Line');
      Sentry.addBreadcrumb({
        category: 'BusinessLine',
        data: {
          ...data,
        },
        message: `BusinessLines Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async update(data: IBusinessLine) {
    this.loading = true;

    try {
      const line = await task(this.service.update(data.id, data));

      const entity = new BusinessLine(this, line);

      this.setItem(entity);

      NotificationHelper.success('update', 'Business Line');

      return entity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Business Line');
      Sentry.addBreadcrumb({
        category: 'BusinessLine',
        data: {
          ...data,
        },
        message: `BusinessLines Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }

  private checkType(id: string | number, type: BusinessLineType) {
    const numberId = +id;
    const rollOfItem = this.sortedValues.find(item => {
      if (item.id === numberId) {
        return item.type === type;
      }

      return false;
    });

    return !!rollOfItem;
  }

  isRollOffType(id: string | number) {
    return this.checkType(id, BusinessLineType.rollOff);
  }

  isRecyclingType(id: string | number) {
    return this.checkType(id, BusinessLineType.recycling);
  }
}
