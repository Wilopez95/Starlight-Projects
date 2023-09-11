import React from 'react';

import { Layouts } from '../../layouts';
import { Typography } from '../Typography/Typography';

import { Badge as BadgeLayout } from './layout/Badge';
import type { IBadge } from './types';

export const Badge: React.FC<IBadge> = ({
  children,
  className,
  borderRadius,
  color = 'primary',
  shade = 'standard',
  bgShade = 'desaturated',
  bgColor = color,
  textTransform = 'capitalize',
}) => (
  <BadgeLayout
    className={className}
    color={color}
    shade={shade}
    borderRadius={borderRadius}
    bgShade={bgShade}
    bgColor={bgColor}
  >
    <Layouts.Padding left="0.5" right="0.5">
      <Typography textTransform={textTransform} variant="bodySmall" color={color} shade={shade}>
        {children}
      </Typography>
    </Layouts.Padding>
  </BadgeLayout>
);
