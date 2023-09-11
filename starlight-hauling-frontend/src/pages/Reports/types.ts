import { ReportFolder } from '@root/types';

export type ReportsParams = {
  subPath: ReportFolder;
};

export type DateRanges = { [key: string]: { start: Date; end: Date } };

export enum ReportTypeEnum {
  ExpressView = 'expressview',
  // Chained = 'chained',
  // Express = 'express',
  AdvancedReport = 'advanced',
  Dashboard = 'dashboard',
}
