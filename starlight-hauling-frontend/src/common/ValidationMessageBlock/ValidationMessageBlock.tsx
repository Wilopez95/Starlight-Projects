import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { InfoIcon } from '@root/assets';

import { Typography } from '../Typography/Typography';

import { IValidationBlock } from './types';

export const ValidationMessageBlock: React.FC<IValidationBlock> = ({
  children,
  color,
  shade,
  textColor,
  borderRadius,
  width,
}) => (
  <Layouts.Box
    backgroundColor={color ?? 'alert'}
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
          <Typography
            as={Layouts.Box}
            width={width}
            color={textColor ?? color}
            variant="bodyMedium"
          >
            {children}
          </Typography>
        </Layouts.Flex>
      </Layouts.Padding>
    </Layouts.Margin>
  </Layouts.Box>
);
