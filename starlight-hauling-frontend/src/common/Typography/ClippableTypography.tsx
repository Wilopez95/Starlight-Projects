import React, { useEffect, useRef } from 'react';
import { Tooltip, useBoolean } from '@starlightpro/shared-components';

import { isTextClipped } from '@root/helpers';

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
