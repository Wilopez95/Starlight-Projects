import React from 'react';
import { Typography } from '@starlightpro/shared-components';

import { PreviewLabel } from './styles';

export const UnassignedJobSitesCount: React.FC = ({ children }) => {
  return (
    <PreviewLabel>
      <Typography variant="bodySmall" color="white">
        {children}
      </Typography>
    </PreviewLabel>
  );
};
