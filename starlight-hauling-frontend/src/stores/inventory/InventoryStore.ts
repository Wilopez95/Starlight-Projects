import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { type IUpdateInventoryRequest } from '@root/api/inventory/types';
import { NotificationHelper } from '@root/helpers';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { InventoryService } from '../../api';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { Inventory } from './Inventory';

export class InventoryStore extends BaseStore<Inventory> {
  private readonly service: InventoryService;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new InventoryService();
  }

  @actionAsync
  async request(businessUnitId: string, businessLineId: string) {
    this.loading = true;

    let inventory;

    try {
      const inventoryResponse = await task(
        this.service.getInventory(businessUnitId, businessLineId),
      );

      inventory = inventoryResponse.map(inventoryItem => new Inventory(this, inventoryItem));

      this.setItems(inventory);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Inventory',
        message: `Inventory Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;

    return inventory;
  }

  @actionAsync
  async updateInventory(businessUnitId: string, data: IUpdateInventoryRequest) {
    this.loading = true;

    try {
      await task(this.service.updateInventory(businessUnitId, data));
      NotificationHelper.success('update', 'Inventory');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Inventory',
        message: `Inventory Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }
}
