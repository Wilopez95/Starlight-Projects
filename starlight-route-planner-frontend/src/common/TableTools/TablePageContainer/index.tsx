import React, { forwardRef } from 'react';
import cx from 'classnames';

import { IBaseComponent } from '@root/types';

import styles from './css/styles.scss';

const TablePageContainer: React.ForwardRefRenderFunction<HTMLDivElement, IBaseComponent> = (
  { className, children },
  ref,
) => (
  <div className={cx(styles.pageContainer, className)} ref={ref}>
    {children}
  </div>
);

export default forwardRef(TablePageContainer);
