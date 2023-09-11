import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';

import { MarkerIcon } from '@root/assets';
import { JobSite } from '@root/stores/entities';

import { LinkedEntity } from '../types';

import styles from '../css/styles.scss';

const LinkedJobSite: React.FC<LinkedEntity<JobSite>> = ({ entity, onClick, to, className }) => {
  const history = useHistory();

  const handleClick = useCallback(() => {
    if (to) {
      history.push(to);
    } else {
      onClick?.(entity);
    }
  }, [entity, history, onClick, to]);

  const address = entity.address;

  return (
    <div onClick={handleClick} className={cx(styles.linkedItem, className)}>
      <MarkerIcon className={styles.icon} />
      <div className={styles.textContainer}>
        <div className={styles.title}>
          {address.addressLine1} {address.addressLine2}
        </div>
        <div className={styles.subTitle}>
          {address.city}, {address.state}, {address.zip}
        </div>
      </div>
    </div>
  );
};

export default observer(LinkedJobSite);
