import { type ICustomerComment, type JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { CustomerCommentStore } from './CustomerCommentStore';

export class CustomerComment extends BaseEntity implements ICustomerComment {
  customerId: number;
  content: string;
  authorId: string;

  store: CustomerCommentStore;

  constructor(store: CustomerCommentStore, entity: JsonConversions<ICustomerComment>) {
    super(entity);

    this.store = store;
    this.customerId = entity.customerId;
    this.content = entity.content;
    this.authorId = entity.authorId;
  }
}
