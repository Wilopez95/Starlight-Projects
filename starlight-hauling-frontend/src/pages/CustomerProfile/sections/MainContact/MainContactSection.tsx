import React from 'react';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';

import styles from '../../css/styles.scss';

interface IMainContactSection {
  name: string;
  email?: string;
  phone?: string;
}

const MainContactSection: React.FC<IMainContactSection> = ({ name, email, phone }) => (
  <>
    <tr>
      <td colSpan={2}>
        <Typography className={styles.sectionHeading} variant="bodyLarge" fontWeight="bold">
          Main Contact
        </Typography>
      </td>
    </tr>
    <tr>
      <td className={styles.label}>Name</td>
      <td>{name}</td>
    </tr>
    <tr>
      <td className={styles.label}>Email</td>
      <td>{email}</td>
    </tr>
    <tr>
      <td className={styles.label}>Phone Number</td>
      <td>
        {phone ? (
          <a href={`tel:${phone}`} className={styles.phoneLink}>
            {phone}
          </a>
        ) : null}
      </td>
    </tr>
    <Divider colSpan={4} bottom />
  </>
);

export default MainContactSection;
