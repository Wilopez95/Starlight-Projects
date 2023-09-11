import React from 'react';

import { Badge } from '@root/common';

import styles from '../../css/styles.scss';

interface IMaterialNavItem {
  text: string;
  active: boolean;
}

const MaterialNavItem: React.FC<IMaterialNavItem> = ({ text, active }) => (
  <>
    <span>{text}</span>
    {!active ? (
      <Badge color="alert" className={styles.inactive}>
        Inactive
      </Badge>
    ) : null}
  </>
);

export default MaterialNavItem;
