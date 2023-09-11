import React, { forwardRef } from 'react';
import cx from 'classnames';

import { IBaseComponent } from '@root/types';

import styles from './css/styles.scss';

const Table: React.ForwardRefRenderFunction<HTMLTableElement, IBaseComponent> = (
  { children, className },
  ref,
) => (
  <table ref={ref} className={cx(styles.table, className)}>
    {children}
  </table>
);

export default forwardRef(Table);
