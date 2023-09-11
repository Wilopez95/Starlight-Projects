import type { ISelectOption } from '@root/core/common/Select/types';

import type { IBaseFilter } from '../../types';

export interface IMultiSelectFilter extends IBaseFilter {
  options: ISelectOption[];
  searchable?: boolean;
}
