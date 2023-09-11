import { haulingHttpClient } from '@root/core/api/base';
import { IReport, ReportFolder } from '@root/finance/types/entities';

export class ReportService {
  getReports(folder: ReportFolder) {
    return haulingHttpClient.get<IReport[]>('reports', {
      folder,
    });
  }

  static async downloadReports(query: string) {
    return haulingHttpClient.get(`reports/download?${query}`);
  }
}
