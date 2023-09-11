import { haulingHttpClient } from '@root/core/api/base';

import { billingHttpClient } from '../httpClient';

import { IExagoCreateSessionResponse, IReportInitOptions, IWrExagoApiOptions } from './types';

const baseUrl = process.env.EXAGO_BACKEND_URL;

export class ExagoService {
  async createStatementSession(
    statementId: number,
    options: Omit<IWrExagoApiOptions, 'WebEndpoint' | 'ApiKey'>,
  ) {
    if (!baseUrl) {
      return;
    }
    try {
      const responseData = await billingHttpClient.post<null, IExagoCreateSessionResponse>(
        `statements/view?id=${statementId}`,
        null,
      );

      const instance = new ExagoApi({
        ...options,
        ApiKey: responseData.ApiKey,
        WebEndpoint: baseUrl,
      });

      return instance;
    } catch (e) {
      console.error('Create Exago session error', e);
    }
  }

  async createReportSession({
    options,
    businessUnitId,
    fromDate,
    toDate,
    path,
    reportType,
    customerId,
    selfService = false,
  }: IReportInitOptions) {
    if (!baseUrl) {
      return;
    }
    try {
      const responseData = await haulingHttpClient.post<
        Omit<IReportInitOptions, 'options'>,
        IExagoCreateSessionResponse
      >(`reports/session/${reportType}`, {
        businessUnitId,
        fromDate,
        toDate,
        path,
        selfService,
        customerId,
      });

      const instance = new ExagoApi({
        ...options,
        ApiKey: responseData.ApiKey,
        WebEndpoint: baseUrl,
      });

      return instance;
    } catch (e) {
      console.error('Create Exago session error', e);
    }
  }

  async initDeleteReportSession(options: Omit<IWrExagoApiOptions, 'WebEndpoint' | 'ApiKey'>) {
    if (!baseUrl) {
      return;
    }
    try {
      const responseData = await billingHttpClient.post<
        { selfService: boolean },
        IExagoCreateSessionResponse
      >(`reports/session/delete`, { selfService: true });

      const instance = new ExagoApi({
        ...options,
        ApiKey: responseData.ApiKey,
        WebEndpoint: baseUrl,
      });

      return instance;
    } catch (e) {
      console.error('Init Delete Exago session error', e);
    }
  }
}
