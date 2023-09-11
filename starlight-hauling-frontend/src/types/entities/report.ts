import { type IEntity } from './entity';

export interface IReport extends IEntity {
  path: string;
  reportName: string;
  reportType: number;
  reportEditName: string;
}

export const enum ReportFolder {
  Operational = 'operational',
  Sales = 'sales',
  Accounting = 'accounting',
  Profitability = 'profitability',
  Custom = 'custom',
}
