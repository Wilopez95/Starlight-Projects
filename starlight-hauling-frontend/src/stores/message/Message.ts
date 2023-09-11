/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IMessage, JsonConversions } from '@root/types';
import { BaseEntity } from '../base/BaseEntity';
import { MessageStore } from './MessageStore';

export class Message extends BaseEntity implements IMessage {
  store: MessageStore;
  message: string;
  userId: string | null;
  authorName: string;
  read: boolean;
  contractorId: number | null;

  constructor(store: MessageStore, entity: JsonConversions<IMessage>) {
    super(entity);

    this.store = store;
    this.message = entity.message;
    this.authorName = entity.authorName;
    this.contractorId = entity.contractorId;
    this.read = entity.read;
    this.userId = entity.userId;
  }

  toString() {
    return this.id.toString();
  }
}
