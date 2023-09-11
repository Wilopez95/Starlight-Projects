import React from 'react';

import { IBasePage } from './types';

import styles from './css/styles.scss';

export const BasePage: React.FC<IBasePage> = ({ component: Component, header: Header }) => (
  <div className={styles.pageContainer}>
    <Header />
    <Component />
  </div>
);
