import React from 'react';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import { JobSite } from '@root/stores/entities';

import styles from '../../css/styles.scss';

const JobSiteNavigationItem: React.FC<{ jobSite: JobSite; onClick: () => void }> = ({
  jobSite: { name, address, active },
  onClick,
}) => (
  <div className={styles.jobSiteNavigationItem} onClick={onClick}>
    <Typography variant="headerFive">
      {name ? (
        name
      ) : (
        <>
          {address.addressLine1} {address.addressLine2 ? ` ${address.addressLine2}` : ''}
        </>
      )}
    </Typography>
    <div className={styles.secondLine}>
      <Typography variant="bodyMedium" color="secondary" shade="desaturated">
        {address.city}, {address.state}
      </Typography>
      {active === false || active === undefined ? (
        <Badge className={styles.badge} color="alert">
          Inactive
        </Badge>
      ) : null}
    </div>
  </div>
);

export default observer(JobSiteNavigationItem);
