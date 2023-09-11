import * as Sentry from '@sentry/react';
import { action, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';
import { NotificationHelper } from '@root/helpers';
import { QbIntegrationsService } from '@root/api';
import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { IQbIntegration } from '@root/types';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';
import { QbIntegrationSettings } from './QbIntegrationSettings';

export class QbIntegrationSettingsStore extends ConfigurationDataBaseStore<QbIntegrationSettings> {
  @observable isOpenModal: boolean = false;

  constructor(global: GlobalStore) {
    super(global, []);
  }

  @actionAsync
  async request() {
    this.loading = true;
    try {
      const accountingResponse = await task(QbIntegrationsService.getQbIntegration());
      this.setItems(
        accountingResponse.map(
          (accounting: {
            integrationBuList: number[] | string;
            password: string;
            dateToAdjustment: number;
            lastSuccessfulIntegration?: string;
            description?: string;
            systemType?: string;
            integrationPeriod: string;
            id: number;
            accountReceivable?: string;
            defaultAccountIncome?: string;
            defaultAccountTax?: string;
            defaultPaymentAccount?: string;
            defaultAccountFinCharges?: string;
            writeoffAccount?: string;
            creditMemoAccount?: string;
            createdAt: string;
            updatedAt: string;
          }) => new QbIntegrationSettings(this, accounting),
        ),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    }

    this.loading = false;
  }

  async delete(id: number) {
    try {
      await QbIntegrationsService.deleteQbIntegration(id);
      NotificationHelper.success('delete', 'Quickbooks Integration');
    } catch (err) {
      const typedError = err as ApiError;
      NotificationHelper.error(
        'delete',
        typedError?.response?.code as ActionCode,
        'Quickbooks Integration',
      );
    }
  }

  async create(
    integrationBuList: number[] | string,
    password: string,
    dateToAdjustment: number,
    lastSuccessfulIntegration?: string,
    description?: string,
    systemType?: string,
    integrationPeriod?: string | Date,
  ) {
    try {
      const result = await QbIntegrationsService.addQbIntegration(
        integrationBuList,
        password,
        dateToAdjustment,
        lastSuccessfulIntegration,
        description,
        systemType,
        integrationPeriod,
      );
      this.generateQWC(result.id);
      NotificationHelper.success('addAccounting');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('addAccounting', typedError.response.code as ActionCode);
      throw Error(typedError.response.message);
    }
  }

  @actionAsync
  async update(data: IQbIntegration, integrationId: number) {
    if (data.integrationBuList && !Array.isArray(data.integrationBuList)) {
      const buList = data.integrationBuList.split(',').map((bu: string) => Number(bu));
      data.integrationBuList = buList;
    }
    this.loading = true;
    try {
      await task(QbIntegrationsService.updateQbIntegration(data, integrationId));
      NotificationHelper.success('update', 'Quickbooks Integration');
    } catch (error) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Quickbooks Integration',
      );
      NotificationHelper.error(
        'create',
        typedError?.response?.code as ActionCode,
        'Quickbooks Integration',
      );
      Sentry.addBreadcrumb({
        category: 'QuickbooksIntegration',
        data: {
          ...data,
        },
        message: `Update Quickbooks Integration Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }

  async generateQWC(id: number) {
    await task(QbIntegrationsService.getQWCFile({ id }));
  }

  @actionAsync
  async requestById(integrationId: number) {
    this.loading = true;
    let integration: QbIntegrationSettings | null = null;
    try {
      const integrationConfig = await task(
        QbIntegrationsService.getQbIntegration({ id: integrationId }),
      );
      integration = new QbIntegrationSettings(this, integrationConfig[0]);
      this.selectEntity(integration);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'QbIntegration',
        data: {
          integrationId,
        },
        message: `QbIntegration Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.loading = false;
  }

  @action
  async toggleModal() {
    this.isOpenModal = !this.isOpenModal;
  }
}
