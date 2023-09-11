import * as Sentry from '@sentry/react';
import { action, computed } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import { NotificationHelper } from '@root/helpers';
import { IMessage } from '@root/types';

import { ActionCode } from '@root/helpers/notifications/types';
import { ApiError } from '@root/api/base/ApiError';
import { ChatService } from '../../api';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { ConvertDateFields, DeepMap } from '../../types/helpers/JsonConversions';
import { Message } from './Message';

export class MessageStore extends BaseStore<Message> {
  private readonly service: ChatService;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new ChatService();
  }

  @actionAsync
  async request(id: number, options: RequestQueryParams = {}) {
    if (this.loading) {
      return;
    }
    this.loading = true;
    try {
      const messagesResponse = await task(
        this.service.requestMessages(id, {
          skip: this.offset,
          limit: this.limit,
          ...options,
        }),
      );
      const messages = messagesResponse.map(message => new Message(this, message));

      this.validateLoading(messagesResponse, this.limit);

      this.setItems(messages);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Message',
        message: `Messages Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...options,
        },
      });
      Sentry.captureException(typedError);
    }

    this.offset += this.limit;
    this.loading = false;
  }

  @action
  setMessage(data: DeepMap<ConvertDateFields<IMessage>>) {
    this.setItem(new Message(this, data));
  }

  @computed
  get sortedValues() {
    return this.sortValues('createdAt', 'desc');
  }
}
