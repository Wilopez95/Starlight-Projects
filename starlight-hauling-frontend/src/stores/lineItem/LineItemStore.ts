import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { NotificationHelper } from '@root/helpers';
import { ILineItem } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { LineItemService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { LineItem } from './LineItem';
import { CreateOptions, RequestOptions } from './types';

export class LineItemStore extends ConfigurationDataBaseStore<LineItem> {
  private readonly service: LineItemService;

  constructor(global: GlobalStore) {
    super(global, ['description']);
    this.service = new LineItemService();
  }

  @actionAsync
  async request(options: RequestOptions) {
    if (this.loading) {
      return;
    }
    this.loading = true;
    try {
      const lineItemsResponse = await task(
        this.service.get({
          ...options,
          limit: this.limit,
          skip: this.offset,
        }),
      );
      this.validateLoading(lineItemsResponse, this.limit);
      const lineItems = lineItemsResponse.map(lineItem => new LineItem(this, lineItem));
      this.setItems(lineItems);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'LineItem',
        data: {
          ...options,
        },
        message: `Line Items Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.offset += this.limit;
    this.loading = false;
  }

  @actionAsync
  async create(entity: ILineItem, { duplicate = false }: CreateOptions = {}) {
    const partialEntity: Omit<ILineItem, 'id'> & { id?: number } = entity;

    if (duplicate) {
      delete partialEntity.id;
    }
    try {
      const newEntity = await task(this.service.create(partialEntity));

      this.setItem(new LineItem(this, newEntity));
      NotificationHelper.success('create', 'Line Item');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Line Item');
      Sentry.addBreadcrumb({
        category: 'LineItem',
        data: {
          ...entity,
        },
        message: `Line Items Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;
    try {
      const response = await task(this.service.getById(id));
      const lineItem = new LineItem(this, response);

      this.setItem(lineItem);
      this.selectEntity(lineItem);

      return lineItem;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'LineItem',
        data: {
          id,
        },
        message: `Line Items Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async update(entity: ILineItem) {
    try {
      this.clearPreconditionFailedError();
      const newEntity = await task(this.service.update(entity.id, entity));

      this.setItem(new LineItem(this, newEntity));
      NotificationHelper.success('update', 'Line Item');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await this.requestById(entity.id);
      }
      NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Line Item');
      Sentry.addBreadcrumb({
        category: 'LineItem',
        data: {
          ...entity,
        },
        message: `Line Items Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }
}
