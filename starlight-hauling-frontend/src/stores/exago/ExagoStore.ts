import * as Sentry from '@sentry/react';
import { observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { ExportType, IReportInitOptions, IWrExagoApiOptions } from '@root/api/exago/types';

import { ApiError } from '@root/api/base/ApiError';
import { ExagoService } from '../../api';

export class ExagoStore {
  @observable instance: ExagoApi | undefined;
  @observable exportType: ExportType;

  private readonly service: ExagoService;

  constructor() {
    this.instance = undefined;
    this.exportType = 'pdf';
    this.service = new ExagoService();
  }

  @actionAsync
  async createReportSession(data: IReportInitOptions) {
    try {
      this.instance = await task(this.service.createReportSession(data));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'Exago',
        data: {
          ...data,
        },
        message: `Exago Init Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async initDeleteReportSession(options: Omit<IWrExagoApiOptions, 'WebEndpoint' | 'ApiKey'>) {
    this.instance = await task(this.service.initDeleteReportSession(options));
  }
}
