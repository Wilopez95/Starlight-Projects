import type { IBaseFilter } from '../../types';

export interface IDateRangeFilter extends IBaseFilter {
  fromDatePropName: string;
  toDatePropName: string;
}
