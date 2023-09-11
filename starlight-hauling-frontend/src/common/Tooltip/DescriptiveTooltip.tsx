import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Typography } from '../Typography/Typography';

import { Tooltip } from './Tooltip';
import { ITooltip } from './types';

export const DescriptiveTooltip: React.FC<Omit<ITooltip, 'children' | 'border'>> = ({
  marker = '?',
  ...props
}) => {
  return (
    <Tooltip {...props} border inline>
      <Typography color="secondary" shade="desaturated" cursor="pointer" variant="caption">
        <Layouts.Flex
          as={Layouts.Box}
          alignItems="center"
          justifyContent="center"
          borderRadius="50%"
          width="14px"
          height="14px"
          aria-label={props.text}
        >
          {marker}
        </Layouts.Flex>
      </Typography>
    </Tooltip>
  );
};
