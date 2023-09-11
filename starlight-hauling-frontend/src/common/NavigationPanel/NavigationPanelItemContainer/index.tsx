import React from 'react';

import styles from './css/styles.scss';

export const NavigationPanelItemContainer: React.FC = ({ children }) => (
  <ul className={styles.navigationPanelContainer} role="menu">
    {children}
  </ul>
);
