import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Typography } from '../Typography/Typography';

import { Tooltip } from './Tooltip';
import { ITooltip } from './types';

export const WarningTooltip: React.FC<Omit<ITooltip, 'children' | 'border'>> = ({ ...props }) => {
  return (
    <Tooltip {...props} border borderColor="primary" borderShade="standard" inline>
      <Typography color="primary" cursor="pointer" variant="caption">
        <Layouts.Flex
          as={Layouts.Box}
          alignItems="center"
          justifyContent="center"
          borderRadius="50%"
          width="14px"
          height="14px"
        >
          !
        </Layouts.Flex>
      </Typography>
    </Tooltip>
  );
};
