import React from 'react';
import cx from 'classnames';

import { LoaderIcon } from '../../assets';

import { ILoader } from './types';

import styles from './css/styles.scss';

export const Loader: React.FC<ILoader> = ({ active = true, className, ...props }) => (
  <LoaderIcon className={cx(styles.loader, active && styles.active, className)} {...props} />
);
