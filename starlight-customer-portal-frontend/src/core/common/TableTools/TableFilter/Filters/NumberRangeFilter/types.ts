import type { IBaseFilter } from '../../types';

export interface INumberRangeFilter extends IBaseFilter {
  fromNumberPropName: string;
  toNumberPropName: string;
}
