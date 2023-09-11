import { ISelectOption } from '@starlightpro/shared-components';

import { type IBaseFilter } from '../../types';

export interface IMultiSelectFilter extends IBaseFilter {
  options: ISelectOption[];
  searchable?: boolean;
}
