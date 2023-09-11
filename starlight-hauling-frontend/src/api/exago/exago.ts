import * as Sentry from '@sentry/react';

import { billingHttpClient } from '@root/api/base';

import { ApiError } from '../base/ApiError';
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
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'Exago',
        data: {
          statementId,
          options,
        },
        message: `Create Exago Statement session error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  async createReportSession({
    options,
    businessUnitId,
    fromDate,
    toDate,
    path,
    reportType,
    linesOfBusiness,
    selfService = false,
  }: IReportInitOptions) {
    if (!baseUrl) {
      return;
    }
    try {
      const responseData = await billingHttpClient.post<
        Omit<IReportInitOptions, 'options'>,
        IExagoCreateSessionResponse
      >(`reports/session/${reportType}`, {
        businessUnitId,
        fromDate,
        toDate,
        path,
        selfService,
        linesOfBusiness,
      });

      const instance = new ExagoApi({
        ...options,
        ApiKey: responseData.ApiKey,
        WebEndpoint: baseUrl,
      });

      return instance;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'Exago',
        data: {
          options,
          businessUnitId,
          fromDate,
          toDate,
          path,
          reportType,
          selfService,
          linesOfBusiness,
        },
        message: `Create Exago Report session error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  async initDeleteReportSession(options: Omit<IWrExagoApiOptions, 'WebEndpoint' | 'ApiKey'>) {
    if (!baseUrl) {
      return;
    }
    try {
      const responseData = await billingHttpClient.post<
        { selfService: boolean; businessUnitId: number },
        IExagoCreateSessionResponse
      >(`reports/session/delete`, {
        selfService: true,
        businessUnitId: options.businessUnitId,
      });

      const instance = new ExagoApi({
        ...options,
        ApiKey: responseData.ApiKey,
        WebEndpoint: baseUrl,
      });

      return instance;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'Exago',
        data: {
          options,
        },
        message: `Init Delete Exago session error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }
}
