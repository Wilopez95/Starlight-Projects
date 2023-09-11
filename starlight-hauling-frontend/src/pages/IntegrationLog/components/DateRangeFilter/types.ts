import { IBaseFilter } from '@root/common/TableTools/TableFilter/types';

export interface IDateRangeFilter extends IBaseFilter {
  fromDatePropName: string;
  toDatePropName: string;
}

export enum DateRanges {
  lastThirtyDays = 'LastThirtyDays',
  custom = 'Custom',
}
