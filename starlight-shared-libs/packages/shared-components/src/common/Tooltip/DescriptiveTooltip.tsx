import React from 'react';

import { Layouts } from '../../layouts';
import { Typography } from '../Typography/Typography';

import { Tooltip } from './Tooltip';
import type { ITooltip } from './types';

export const DescriptiveTooltip: React.FC<Omit<ITooltip, 'children' | 'border'>> = ({
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
          ?
        </Layouts.Flex>
      </Typography>
    </Tooltip>
  );
};
