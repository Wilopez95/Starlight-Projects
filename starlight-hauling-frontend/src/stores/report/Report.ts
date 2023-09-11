import { IReport, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { ReportStore } from './ReportStore';

export class Report extends BaseEntity {
  path: string;
  reportName: string;
  reportEditName: string;
  reportType: number;
  store: ReportStore;

  constructor(store: ReportStore, entity: JsonConversions<IReport>) {
    super(entity);

    this.reportName = entity.reportName;
    this.reportType = entity.reportType;
    this.reportEditName = entity.reportEditName;
    this.path = entity.path;
    this.store = store;
  }
}
