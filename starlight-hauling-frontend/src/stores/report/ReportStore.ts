import * as Sentry from '@sentry/react';
import { subDays } from 'date-fns';
import { groupBy } from 'lodash-es';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { NotificationHelper, sortEntities } from '@root/helpers';
import { ReportFolder, SortType } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { ReportService } from '../../api';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { Report } from './Report';
import { ReportSortType } from './types';

const currentDate = new Date();

export class ReportStore extends BaseStore<Report, ReportSortType> {
  private readonly service: ReportService;
  private queryController = new AbortController();
  @observable startDate: Date = subDays(currentDate, 29);
  @observable endDate: Date = currentDate;
  @observable dateRange = 'lastThirtyDays';
  @observable linesOfBusiness: number[] = [0];
  @observable lastRequestAnchor: symbol | null = null;

  constructor(global: GlobalStore) {
    super(global, 'reportName', 'asc');
    this.service = new ReportService();
  }

  @action.bound
  setSort(sortBy: ReportSortType, sortOrder: SortType) {
    this.sortOrder = sortOrder;
    this.sortBy = sortBy;
  }

  @action.bound
  cleanup() {
    this.queryController.abort();
    this.queryController = new AbortController();
    super.cleanup();
  }

  @actionAsync
  async request(folder: ReportFolder) {
    this.cleanup();
    this.loading = true;

    try {
      const reportsResponse = await task(
        this.service.getReports(
          {
            folder,
            sortBy: this.sortBy,
            sortOrder: this.sortOrder,
          },
          this.queryController.signal,
        ),
      );

      this.setItems(
        reportsResponse.map((report, index) => new Report(this, { ...report, id: index })),
      );
      this.loading = false;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      if (typedError && typedError.name !== 'AbortError') {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        Sentry.addBreadcrumb({
          category: 'Report',
          message: `Reports Request Error ${JSON.stringify(typedError?.message)}`,
          data: {
            folder,
          },
        });
        Sentry.captureException(typedError);
        this.loading = false;
      }
    }
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

  @action
  setBusinessLines(linesOfBusiness: number[]) {
    this.linesOfBusiness = linesOfBusiness;
  }

  @computed get sortedValues() {
    const baseValues = this.values;
    const sortBy = this.sortBy;
    const sortOrder = this.sortOrder;

    if (!sortBy) {
      return baseValues;
    }

    if (sortBy === 'reportName') {
      return sortEntities(
        baseValues,
        [
          {
            key: sortBy,
            order: sortOrder,
          },
        ],
        false,
      );
    }

    const groups = groupBy(baseValues, x => x.reportType);

    const dashboardGroup = groups[2] ?? [];

    delete groups[2];

    const otherGroups = Object.values(groups).flat(1);

    if (sortOrder === 'asc') {
      return [...dashboardGroup, ...otherGroups];
    } else {
      return [...otherGroups, ...dashboardGroup];
    }
  }
}
