import { action, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';
import { NotificationHelper } from '@root/helpers';
import { qbBillableItemsService } from '@root/api';
import { IQbBillableItems, IQbBillableItemsortedAccounts } from '@root/types/entities';
import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';
import { QbBillableItems } from './QbBillableItems';

export class QbBillableItemsStore extends ConfigurationDataBaseStore<IQbBillableItems> {
  @observable isOpenModal: boolean = false;
  constructor(global: GlobalStore) {
    super(global, []);
  }

  @actionAsync
  async request(integrationId: number, billableItemType: string[]) {
    this.cleanup();
    this.loading = true;
    try {
      const qbBillableItemsResponse = await task(
        qbBillableItemsService.getQbBillableItems(integrationId, billableItemType),
      );
      this.setItems(
        qbBillableItemsResponse.items.map(billableItem => new QbBillableItems(this, billableItem)),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    }
    this.loading = false;
  }

  @actionAsync
  async insertMany(
    integrationId: number,
    values: IQbBillableItemsortedAccounts[],
    billableItemType: string[],
  ) {
    this.cleanup();
    this.loading = true;
    try {
      await task(
        qbBillableItemsService.insertManyQbBillableItems(integrationId, values, billableItemType),
      );
      NotificationHelper.success('create', 'Quickbooks Billable Items');
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
