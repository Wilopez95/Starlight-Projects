import * as Sentry from '@sentry/react';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { IMasterRouteVariables } from '@root/api/masterRoute/types';

import { ApiError } from '@root/api/base/ApiError';
import { MasterRouteService } from '../../api';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { MasterRoute } from './MasterRoute';

export class MasterRouteStore extends BaseStore<MasterRoute> {
  private readonly service: MasterRouteService;

  @observable
  private selectedRouteNames: Set<string> = new Set();

  constructor(global: GlobalStore) {
    super(global);
    this.service = new MasterRouteService();
  }

  @actionAsync
  async request(variables: IMasterRouteVariables) {
    try {
      const response = await task(this.service.request(variables));

      this.setItems(response.masterRoutes.map(masterRoute => new MasterRoute(this, masterRoute)));
      this.validateLoading(response.masterRoutes, this.limit);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'MasterRoute',
        message: `Master Routes Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...variables,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @action
  setSelectedRoutes(routes: string[]) {
    this.selectedRouteNames.clear();
    routes.forEach(name => this.selectedRouteNames.add(name));
  }

  @computed
  get selectedRoutes() {
    return this.values.filter(({ name }) => this.selectedRouteNames.has(name));
  }
}
