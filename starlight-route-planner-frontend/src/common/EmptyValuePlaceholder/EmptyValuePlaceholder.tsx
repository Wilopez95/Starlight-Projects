import React from 'react';
import { Typography } from '@starlightpro/shared-components';

export const EmptyValuePlaceholder: React.FC = () => {
  return (
    <Typography variant="bodyMedium" color="secondary" shade="desaturated">
      –
    </Typography>
  );
};
