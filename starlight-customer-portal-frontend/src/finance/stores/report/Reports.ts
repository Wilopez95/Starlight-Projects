import { BaseEntity } from '@root/core/stores/base/BaseEntity';
import { JsonConversions } from '@root/core/types';
import { IReport } from '@root/finance/types/entities';

import { ReportStore } from './ReportStore';

export class Report extends BaseEntity {
  path: string;
  reportName: string;
  reportEditName: string;
  store: ReportStore;
  reportType: number;

  constructor(store: ReportStore, entity: JsonConversions<IReport>) {
    super(entity);

    this.reportName = entity.reportName;
    this.reportEditName = entity.reportEditName;
    this.path = entity.path;
    this.store = store;
    this.reportType = entity.reportType;
  }
}
