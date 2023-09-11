import React from 'react';

import { Layouts } from '../../layouts';
import { Typography } from '../Typography/Typography';

import { IReadOnlyFormField } from './types';

import styles from './css/styles.scss';

export const ReadOnlyFormField: React.FC<IReadOnlyFormField> = ({ label, value }) => {
  return (
    <Layouts.Box height="62px">
      {label ? (
        <Typography as="label" shade="desaturated" color="secondary" variant="bodyMedium">
          <Layouts.Margin top="0.5" bottom="0.5">
            {label}
          </Layouts.Margin>
        </Typography>
      ) : null}
      <input readOnly={true} className={styles.input} value={value} />
    </Layouts.Box>
  );
};
