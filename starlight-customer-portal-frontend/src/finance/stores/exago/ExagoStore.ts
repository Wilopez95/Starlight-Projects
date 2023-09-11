import { observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { ExagoService } from '@root/finance/api/exago/exago';
import { ExportType, IReportInitOptions, IWrExagoApiOptions } from '@root/finance/api/exago/types';

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
  async createStatementSession(
    statementId: number,
    options: Omit<IWrExagoApiOptions, 'WebEndpoint' | 'ApiKey'>,
  ) {
    this.instance = await task(this.service.createStatementSession(statementId, options));
  }

  @actionAsync
  async createReportSession(data: IReportInitOptions) {
    this.instance = await task(this.service.createReportSession(data));
  }

  @actionAsync
  async initDeleteReportSession(options: Omit<IWrExagoApiOptions, 'WebEndpoint' | 'ApiKey'>) {
    this.instance = await task(this.service.initDeleteReportSession(options));
  }
}
