import React from 'react';
import cx from 'classnames';

import styles from '../css/styles.scss';
import { IItem } from './types';

export const Item: React.FC<IItem> = ({ className, children, editable, inline, onClick }) => (
  <div
    className={cx(styles.item, { [styles.inline]: inline, [styles.editable]: editable }, className)}
    onClick={onClick}
  >
    {children}
  </div>
);
