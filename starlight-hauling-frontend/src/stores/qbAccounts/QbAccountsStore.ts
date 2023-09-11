import { action, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';
import { NotificationHelper } from '@root/helpers';
import { IQbAccounts } from '@root/types/entities';
import { ActionCode } from '@root/helpers/notifications/types';
import { ApiError } from '@root/api/base/ApiError';
import { qbAccountsService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';
import { QbAccount } from './QbAccounts';

export class QbAccountsStore extends ConfigurationDataBaseStore<IQbAccounts> {
  @observable isOpenModal: boolean = false;
  constructor(global: GlobalStore) {
    super(global, []);
  }

  @actionAsync
  async request(integrationId: number) {
    this.cleanup();
    this.loading = true;
    try {
      const qbAccountsResponse = await task(qbAccountsService.getQbAccounts(integrationId));
      this.setItems(qbAccountsResponse.items.map(account => new QbAccount(this, account)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    }
    this.loading = false;
  }

  @action
  async toggleModal() {
    this.isOpenModal = !this.isOpenModal;
  }
}
