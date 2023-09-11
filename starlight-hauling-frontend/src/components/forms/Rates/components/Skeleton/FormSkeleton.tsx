import React, { memo } from 'react';
import { range } from 'lodash-es';

import { Loadable } from '@root/common';

import styles from '../../css/styles.scss';

const FormSkeleton: React.FC = memo(() => {
  return (
    <>
      {range(7).map(key => (
        <div className={styles.skeletonRow} key={key}>
          <Loadable height={34} className={styles.skeleton} />
          <Loadable height={34} className={styles.skeleton} />
        </div>
      ))}
    </>
  );
});

export default FormSkeleton;
