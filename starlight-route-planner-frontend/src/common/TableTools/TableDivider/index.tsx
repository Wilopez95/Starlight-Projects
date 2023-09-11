import React from 'react';
import cx from 'classnames';

import { IDivider } from './types';

import styles from './css/styles.scss';

export const Divider: React.FC<IDivider> = ({ top, bottom, both, className, colSpan }) => {
  const name = cx(
    styles.divider,
    {
      [styles.top]: top,
      [styles.bottom]: bottom,
      [styles.both]: both,
    },
    className,
  );

  return colSpan ? (
    <tr>
      <td colSpan={colSpan}>
        <div className={name} />
      </td>
    </tr>
  ) : (
    <div className={name} />
  );
};
