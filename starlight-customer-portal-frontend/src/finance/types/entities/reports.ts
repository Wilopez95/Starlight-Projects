import { IEntity } from '@root/core/types';

export interface IReport extends IEntity {
  path: string;
  reportName: string;
  reportEditName: string;
  reportType: number;
}

export const enum ReportFolder {
  Operational = 'operational',
  Sales = 'sales',
  Accounting = 'accounting',
  Custom = 'custom',
}
