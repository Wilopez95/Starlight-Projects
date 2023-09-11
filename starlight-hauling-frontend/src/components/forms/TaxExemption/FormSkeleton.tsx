import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { range } from 'lodash-es';

import { Loadable } from '@root/common';

import styles from './css/styles.scss';

const rowCount = 5;

const FormSkeleton: React.FC = () => (
  <>
    {range(rowCount).map(key => (
      <Layouts.Flex key={key}>
        <Loadable height={34} className={styles.skeleton} />
        <Loadable height={34} className={styles.skeleton} />
      </Layouts.Flex>
    ))}
  </>
);

export default FormSkeleton;
