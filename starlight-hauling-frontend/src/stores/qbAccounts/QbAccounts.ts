import { type JsonConversions, IQbAccounts } from '@root/types';
import { BaseEntity } from '../base/BaseEntity';
import { QbAccountsStore } from './QbAccountsStore';

export class QbAccount extends BaseEntity implements IQbAccounts {
  quickBooksId: string;
  integrationId: number;
  name: string;
  type: string;
  store: QbAccountsStore;
  checked: boolean;

  constructor(store: QbAccountsStore, entity: JsonConversions<IQbAccounts>) {
    super(entity);
    this.store = store;
    this.id = entity.id;
    this.quickBooksId = entity.quickBooksId;
    this.integrationId = entity.integrationId;
    this.name = entity.name;
    this.type = entity.type;
    this.checked = entity.checked;
  }
}
