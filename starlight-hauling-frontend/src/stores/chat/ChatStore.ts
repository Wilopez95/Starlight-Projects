import * as Sentry from '@sentry/react';
import i18next from 'i18next';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import { NotificationHelper } from '@root/helpers';
import { IStoreCount } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { ChatService } from '../../api';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { Chat } from './Chats';

const I18N_PATH = 'pages.Chats.table.Text.';

export class ChatStore extends BaseStore<Chat> {
  private readonly service: ChatService;

  @observable counts?: Omit<IStoreCount, 'filteredTotal'>;
  @observable mineOnly = false;

  constructor(global: GlobalStore) {
    super(global, 'lastMsgTimestamp', 'desc');
    this.service = new ChatService();
  }

  @action toggleOnlyMine() {
    const currentOnlyMine = this.mineOnly;

    this.cleanup();
    this.mineOnly = !currentOnlyMine;
  }

  @actionAsync
  async request(options: RequestQueryParams & { businessUnitId: string }) {
    this.loading = true;
    try {
      const chatsResponse = await task(
        this.service.get({
          skip: this.offset,
          limit: this.limit,
          mine: this.mineOnly,
          ...options,
        }),
      );

      this.validateLoading(chatsResponse, this.limit);
      this.setItems(chatsResponse.map(chat => new Chat(this, chat)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Chat',
        message: `Chats Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...options,
        },
      });
      Sentry.captureException(typedError);
    }

    this.offset += this.limit;
    this.loading = false;
  }

  @actionAsync
  async requestCount(options: RequestQueryParams & { businessUnitId: string }) {
    try {
      const data = await task(this.service.getCount({ businessUnitId: options.businessUnitId }));

      this.counts = data;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Chat',
        message: `Chats Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...options,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async markAsResolvedGroupOfChats() {
    this.loading = true;
    try {
      const checkedChats = this.values.filter(chat => chat.checked);
      const checkedChatIds = checkedChats.map(chat => chat.id);

      await task(this.service.markAsResolvedChats(checkedChatIds));

      checkedChats.forEach(chat => {
        chat.setResolvedStatus();
        chat.check();
      });

      NotificationHelper.custom('success', i18next.t(`${I18N_PATH}ChatMarkAsResolved`));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Chat',
        message: `Chats Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async markAsResolvedChat() {
    this.loading = true;

    try {
      if (this.selectedEntity) {
        await task(this.service.markAsResolvedChats([this.selectedEntity.id] as number[]));

        this.selectedEntity.setResolvedStatus();

        NotificationHelper.custom('success', i18next.t(`${I18N_PATH}ChatMarkAsResolved`));
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Chat',
        message: `Chats Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @computed
  get sortedValues() {
    return this.sortValues(this.sortBy as keyof Chat, this.sortOrder);
  }

  @action checkAll(value: boolean) {
    this.values.forEach(chat => (chat.checked = value));
  }

  @computed get checkedChats() {
    return this.values.filter(chat => chat.checked);
  }

  @computed get isAllChecked() {
    const chats = this.values;
    const loading = this.loading;

    return this.checkedChats.length === chats.length && chats.length > 0 && !loading;
  }
}
