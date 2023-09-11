import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { DailyRouteService } from '@root/api/dailyRoute/dailyRoute';
import { IDailyRouteVariables } from '@root/api/dailyRoute/types';

import { ApiError } from '@root/api/base/ApiError';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { DailyRoute } from './DailyRoute';

export class DailyRouteStore extends BaseStore<DailyRoute> {
  private readonly service: DailyRouteService = new DailyRouteService();

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(global: GlobalStore) {
    super(global);
  }

  @actionAsync
  async request(variables: IDailyRouteVariables) {
    this.loading = true;

    try {
      const response = await task(this.service.request(variables));

      this.setItems(response.dailyRoutes.map(dailyRoute => new DailyRoute(this, dailyRoute)));
      this.validateLoading(response.dailyRoutes, this.limit);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'DailyRoute',
        message: `Daily Routes Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...variables,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }
}
