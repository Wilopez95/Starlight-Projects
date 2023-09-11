import { endOfToday, startOfToday } from 'date-fns';
import { action, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import GlobalStore from '@root/app/GlobalStore';
import { BaseStore } from '@root/core/stores/base/BaseStore';
import { ReportService } from '@root/finance/api/report/reports';
import { ReportFolder } from '@root/finance/types/entities';

import { Report } from './Reports';

export class ReportStore extends BaseStore<Report> {
  private readonly service: ReportService;
  @observable startDate: Date = startOfToday();
  @observable endDate: Date = endOfToday();
  @observable dateRange = 'today';

  constructor(global: GlobalStore) {
    super(global);
    this.service = new ReportService();
  }

  @actionAsync async request(folder: ReportFolder) {
    this.cleanup();
    this.loading = true;

    try {
      const reportsResponse = await task(this.service.getReports(folder));

      this.setItems(
        reportsResponse.map((report, index) => new Report(this, { ...report, id: index })),
      );
    } catch (error) {
      console.error('Reports Request Error', error);
    }
    this.loading = false;
  }

  @action.bound
  setStartDate(start: Date) {
    this.startDate = start;
  }

  @action.bound
  setEndDate(end: Date) {
    this.endDate = end;
  }

  @action.bound
  setDateRange(dateRange: string) {
    this.dateRange = dateRange;
  }
}
