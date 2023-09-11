import React from 'react';
import { Tooltip } from '@starlightpro/shared-components';

import { InfoIcon } from './styled';
import { IWarningPreview } from './types';

export const WarningPreview: React.FC<IWarningPreview> = ({ text, position = 'top' }) => (
  <Tooltip position={position} text={text}>
    <InfoIcon />
  </Tooltip>
);
