import * as Sentry from '@sentry/react';
import { action, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { NotificationHelper } from '@root/helpers';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { LobbyService } from '../../api';
import { ResourceLogin } from '../../api/lobby/types';

export class LobbyStore {
  @observable loading = false;
  @observable resourceLogins: ResourceLogin[] = [];

  private readonly service: LobbyService;

  constructor() {
    this.service = new LobbyService();
  }

  @actionAsync
  async requestActiveResourceLogins() {
    this.loading = true;

    try {
      this.resourceLogins = await task(this.service.getAvailableResourceLogins());
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Lobby',
        message: `Request Active Resource Logins Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @action
  clearResources() {
    this.loading = false;
    this.resourceLogins = [];
  }
}
