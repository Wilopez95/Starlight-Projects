import React from 'react';

import { Badge, Typography } from '../../../../../../../common';
import { addressFormatShort } from '../../../../../../../helpers';
import { type IAddress } from '../../../../../../../types';

import styles from './css/styles.scss';

interface ICustomerNavItem {
  name: string;
  address: IAddress;
  invoicesCount: number;
  warning?: boolean;
}

const CustomerNavItem: React.FC<ICustomerNavItem> = ({ name, address, warning, invoicesCount }) => (
  <div className={styles.navItem}>
    <div>
      <Typography>{name}</Typography>
      <Typography color="secondary" shade="desaturated">
        {addressFormatShort(address)}
      </Typography>
    </div>
    <div className={styles.side}>
      {warning ? <div className={styles.creditExceeded} /> : null}
      <Badge color="secondary" shade="desaturated" className={styles.invoicesCount}>
        <Typography color="white">{invoicesCount}</Typography>
      </Badge>
    </div>
  </div>
);

export default CustomerNavItem;
