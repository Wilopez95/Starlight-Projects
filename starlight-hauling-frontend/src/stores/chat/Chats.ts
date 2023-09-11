import { action, observable } from 'mobx';

import { ChatStatus } from '@root/consts';
import { parseDate } from '@root/helpers';
import { IChat, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { ChatStore } from './ChatStore';

export class Chat extends BaseEntity implements IChat {
  store: ChatStore;
  customerName: string;
  contactName: string;
  lastMsgTimestamp: Date;
  @observable status: ChatStatus;
  @observable lastMessage: string;
  @observable lastReplier: string;
  @observable read: boolean;
  @observable checked = false;

  constructor(store: ChatStore, entity: JsonConversions<IChat>) {
    super(entity);

    this.store = store;
    this.status = entity.status;
    this.lastReplier = entity.lastReplier;
    this.lastMessage = entity.lastMessage;
    this.customerName = entity.customerName;
    this.contactName = entity.contactName;
    this.read = entity.read;
    this.lastMsgTimestamp = parseDate(entity.lastMsgTimestamp);
  }

  @action.bound check() {
    this.checked = !this.checked;
  }

  @action.bound setResolvedStatus() {
    this.status = ChatStatus.Resolved;
  }

  @action.bound updateLastMessageData(lastMessage: string, lastReplier: string) {
    this.lastMessage = lastMessage;
    this.lastReplier = lastReplier;
  }

  @action.bound markChatAsRead() {
    this.read = true;
  }
}
