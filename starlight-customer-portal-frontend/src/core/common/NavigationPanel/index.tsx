import React from 'react';
import cx from 'classnames';

import { IBaseComponent } from '@root/core/types';

import styles from './css/styles.scss';

export const NavigationPanel: React.FC<IBaseComponent> = ({ children, className }) => (
  <aside className={cx(styles.navigationPanelContainer, className)}>{children}</aside>
);

export * from './NavigationPanelItem';
export * from './NavigationPanelItemContainer';
