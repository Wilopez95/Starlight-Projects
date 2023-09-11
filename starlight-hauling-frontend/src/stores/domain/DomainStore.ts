import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { NotificationHelper } from '@root/helpers';

import { ActionCode } from '@root/helpers/notifications/types';
import { ApiError } from '@root/api/base/ApiError';
import { CompanyService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { Domain } from './Domain';

export class DomainStore extends ConfigurationDataBaseStore<Domain> {
  constructor(global: GlobalStore) {
    super(global, []);
  }

  @actionAsync
  async request() {
    this.loading = true;
    try {
      const domainsResponse = await task(CompanyService.getDomains());

      this.setItems(domainsResponse.map(domain => new Domain(this, domain)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Domain',
        message: `Domain Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  async delete(id: number) {
    try {
      return CompanyService.deleteDomain(id);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('deleteDomain', typedError.response.code as ActionCode);
    }
  }

  async validateDomain(id: number) {
    try {
      const result = await CompanyService.validateDomainAuthentication(id);

      if (result.validationStatus === 'validated') {
        NotificationHelper.success('validateDomainAuthentication');
      } else {
        NotificationHelper.error('validateDomainAuthentication');
      }
    } catch {
      NotificationHelper.error('validateDomainAuthentication');
    }
  }

  async create(name: string) {
    try {
      await CompanyService.addDomain(name);
      NotificationHelper.success('addDomain');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('addDomain', typedError.response.code as ActionCode);
    }
  }
}
