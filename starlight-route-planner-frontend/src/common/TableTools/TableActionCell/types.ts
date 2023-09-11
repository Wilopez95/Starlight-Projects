import { ICheckbox } from '@starlightpro/shared-components';

import { ITableCell } from '../TableCell/types';

export interface ITableActionCell
  extends ITableCell,
    Pick<ICheckbox, 'name' | 'value' | 'onChange' | 'indeterminate' | 'disabled'> {
  header?: boolean;
  action?: 'checkbox' | 'radio';
}
