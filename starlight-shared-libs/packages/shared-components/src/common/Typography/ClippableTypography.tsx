import React, { useEffect, useRef } from 'react';

import { isTextClipped } from '../../helpers';
import { useBoolean } from '../../hooks';
import { Tooltip } from '../Tooltip/Tooltip';

import { ITypographyLayout } from './types';
import { Typography } from './Typography';

export const ClippableTypography: React.FC<ITypographyLayout & { children: string }> = ({
  children,
  ...typographyProps
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTooltipActive, activateTooltip, deactivateTooltip] = useBoolean(false);

  useEffect(() => {
    if (textRef.current && isTextClipped(textRef.current)) {
      activateTooltip();
    } else {
      deactivateTooltip();
    }
  }, [children, activateTooltip, deactivateTooltip]);

  const text = (
    <Typography {...typographyProps} ellipsis ref={textRef}>
      {children}
    </Typography>
  );

  if (isTooltipActive) {
    return (
      <Tooltip fullWidth text={children} position="top">
        {text}
      </Tooltip>
    );
  }

  return text;
};
