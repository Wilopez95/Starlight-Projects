import { actionAsync, task } from 'mobx-utils';
import { NotificationHelper } from '@root/helpers';
import { IQbIntegrationLog } from '@root/types';
import { ActionCode } from '@root/helpers/notifications/types';
import { ApiError } from '@root/api/base/ApiError';
import { QbIntegrationLogService } from '../../api/qbIntegrationLog/qbIntegrationLog';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';
import { QbIntegrationLog } from './QbIntegrationLog';

export class QbIntegrationLogStore extends ConfigurationDataBaseStore<IQbIntegrationLog> {
  constructor(global: GlobalStore) {
    super(global, []);
  }

  @actionAsync
  async request() {
    this.loading = true;
    try {
      const accountingResponse = await task(QbIntegrationLogService.getQbIntegrationLog({}, {}));
      this.setItems(
        accountingResponse.items.map(accounting => new QbIntegrationLog(this, accounting)),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    }
    this.loading = false;
  }
}
