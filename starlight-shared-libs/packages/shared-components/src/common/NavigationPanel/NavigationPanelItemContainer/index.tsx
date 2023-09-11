import React from 'react';

import styles from './css/styles.scss';

export const NavigationPanelItemContainer: React.FC = ({ children }) => (
  <ul role="menu" className={styles.navigationPanelContainer}>
    {children}
  </ul>
);
