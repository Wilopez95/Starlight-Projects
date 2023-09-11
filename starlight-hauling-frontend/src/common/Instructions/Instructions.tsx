import React from 'react';
import { CollapsibleBar, Layouts } from '@starlightpro/shared-components';

import { Typography } from '../Typography/Typography';

import { IInstructions } from './types';

export const Instructions: React.FC<IInstructions> = ({ className, children, headerText = '' }) => (
  <Layouts.Box
    borderRadius="3px"
    backgroundColor="grey"
    backgroundShade="light"
    className={className}
  >
    <Layouts.Padding padding="2" right="1" left="1">
      <CollapsibleBar
        label={
          <Typography variant="headerFour" color="secondary" cursor="pointer">
            {headerText}
          </Typography>
        }
      >
        <Layouts.Margin top="2">
          <Typography color="secondary">{children}</Typography>
        </Layouts.Margin>
      </CollapsibleBar>
    </Layouts.Padding>
  </Layouts.Box>
);
