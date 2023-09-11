import React from 'react';

import { InfoIcon } from '../../assets';
import { Layouts } from '../../layouts';
import { Typography } from '../Typography/Typography';

import type { IValidationBlock } from './types';

export const ValidationMessageBlock: React.FC<IValidationBlock> = ({
  children,
  color,
  shade,
  textColor,
  borderRadius,
}) => (
  <Layouts.Box
    backgroundColor={color || 'alert'}
    backgroundShade={shade}
    borderRadius={borderRadius}
  >
    <Layouts.Margin bottom="1">
      <Layouts.Padding padding="1" left="2" right="2">
        <Layouts.Flex alignItems="center">
          <Layouts.Margin right="1">
            <Typography color={color}>
              <InfoIcon />
            </Typography>
          </Layouts.Margin>
          <Typography color={textColor || color} variant="bodyMedium">
            {children}
          </Typography>
        </Layouts.Flex>
      </Layouts.Padding>
    </Layouts.Margin>
  </Layouts.Box>
);
