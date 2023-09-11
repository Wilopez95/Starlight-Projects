import { IReport } from '@root/types';

import { billingHttpClient } from '../base';

import { RequestReportsOptions } from './types';

export class ReportService {
  getReports(options: RequestReportsOptions, abortSignal?: AbortSignal) {
    return billingHttpClient.get<IReport[]>('reports/', options, abortSignal);
  }

  static async downloadReports(query: string) {
    return billingHttpClient.get(`reports/download?${query}`);
  }
}
