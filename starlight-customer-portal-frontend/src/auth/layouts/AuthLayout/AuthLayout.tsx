import React from 'react';

import styles from './css/styles.scss';

export const AuthLayout: React.FC = ({ children }) => (
  <div className={styles.loginPage}>
    <div className={styles.left} />
    <div className={styles.right}>{children}</div>
  </div>
);
