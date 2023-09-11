import { type IBaseFilter } from '../../types';

export interface ITimeRangeFilter extends IBaseFilter {
  fromTimePropName: string;
  toTimePropName: string;
}
