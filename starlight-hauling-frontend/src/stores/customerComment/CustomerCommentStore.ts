import * as Sentry from '@sentry/react';
import { computed } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { CustomerCommentService } from '@root/api/customerComment/customerComment';
import { NotificationHelper } from '@root/helpers';
import { CustomerCommentRequest } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { CustomerComment } from './CustomerComment';

export class CustomerCommentStore extends BaseStore<CustomerComment> {
  private service: CustomerCommentService;

  constructor(global: GlobalStore) {
    super(global);

    this.service = new CustomerCommentService();
  }

  @computed
  get sortedValues() {
    return this.sortValues(this.sortBy as keyof CustomerComment, this.sortOrder);
  }

  @actionAsync
  async request(customerId: number) {
    this.cleanup();
    this.loading = true;
    try {
      const commentsResponse = await task(this.service.get(customerId));

      this.setItems(commentsResponse.map(comment => new CustomerComment(this, comment)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Comment',
        message: `Customer Comments Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          customerId,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(customerId: number, data: CustomerCommentRequest) {
    try {
      const newComment = await task(this.service.create(customerId, data));

      this.setItem(new CustomerComment(this, newComment));
      NotificationHelper.success('create', 'Customer comment');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'create',
        typedError?.response?.code as ActionCode,
        'Customer comment',
      );
      Sentry.addBreadcrumb({
        category: 'Comment',
        message: `Customer Comments Create Error ${JSON.stringify(typedError?.message)}`,
        data: {
          customerId,
          ...data,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async update(customerId: number, commentId: number, data: CustomerCommentRequest) {
    try {
      const updatedComment = await task(this.service.patch(customerId, commentId, data));

      this.setItem(new CustomerComment(this, updatedComment));
      NotificationHelper.success('update', 'Customer comment');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Customer comment',
      );
      Sentry.addBreadcrumb({
        category: 'Comment',
        message: `Customer Comments Update Error ${JSON.stringify(typedError?.message)}`,
        data: {
          customerId,
          commentId,
          ...data,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async delete(customerId: number, commentId: number) {
    try {
      await task(this.service.delete(customerId, commentId));

      this.removeEntity(commentId);
      NotificationHelper.success('delete', 'Customer comment');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'delete',
        typedError?.response?.code as ActionCode,
        'Customer comment',
      );
      Sentry.addBreadcrumb({
        category: 'Comment',
        message: `Customer Comments Delete Error ${JSON.stringify(typedError?.message)}`,
        data: {
          customerId,
          commentId,
        },
      });
      Sentry.captureException(typedError);
    }
  }
}
