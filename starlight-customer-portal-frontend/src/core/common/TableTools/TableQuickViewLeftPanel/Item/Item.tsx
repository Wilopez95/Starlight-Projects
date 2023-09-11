import React from 'react';
import cx from 'classnames';

import { IItem } from './types';

import styles from '../css/styles.scss';

export const Item: React.FC<IItem> = ({ className, children, editable, inline, onClick }) => (
  <div
    className={cx(styles.item, { [styles.inline]: inline, [styles.editable]: editable }, className)}
    onClick={onClick}
  >
    {children}
  </div>
);
