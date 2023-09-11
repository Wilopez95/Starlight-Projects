import React, { memo } from 'react';
import cx from 'classnames';

import { IOptionItem } from './types';

import styles from './css/styles.scss';

export const OptionItemComponent: React.FC<IOptionItem> = ({
  children,
  className,
  disabled = false,
  onClick,
  selected = false,
  wrapperClassName,
}) => (
  <li
    className={cx(styles.optionItem, { [styles.disabled]: disabled }, wrapperClassName)}
    onClick={disabled ? undefined : onClick}
    tabIndex={0}
    aria-selected={selected}
  >
    {className ? <div className={className}>{children}</div> : children}
  </li>
);

export const OptionItem = memo(OptionItemComponent);
