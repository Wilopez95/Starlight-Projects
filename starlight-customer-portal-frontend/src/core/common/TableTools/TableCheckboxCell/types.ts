import { ICheckbox } from '@starlightpro/shared-components';

import { ITableCell } from '../TableCell/types';

export interface ITableCheckboxCell
  extends ITableCell,
    Pick<ICheckbox, 'name' | 'value' | 'onChange' | 'indeterminate' | 'disabled'> {
  header?: boolean;
}
