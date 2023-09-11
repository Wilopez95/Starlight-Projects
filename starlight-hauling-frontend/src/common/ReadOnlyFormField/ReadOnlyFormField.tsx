import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Typography } from '../Typography/Typography';

import { IReadOnlyFormField } from './types';

export const ReadOnlyFormField: React.FC<IReadOnlyFormField> = ({ label, value }) => {
  return (
    <Layouts.Box height="62px">
      {label ? (
        <Layouts.Flex justifyContent="flex-end">
          <Typography as="label" shade="desaturated" color="secondary" variant="bodyMedium">
            {label}
          </Typography>
        </Layouts.Flex>
      ) : null}
      <Layouts.Flex justifyContent="flex-end">
        <Layouts.Padding top="2">
          <Typography variant="bodyMedium">{value}</Typography>
        </Layouts.Padding>
      </Layouts.Flex>
    </Layouts.Box>
  );
};
