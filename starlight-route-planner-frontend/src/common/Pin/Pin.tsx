import React from 'react';

import { PinDisk } from './PinDisk/PinDisk';
import { DefaultPin } from './Default';
import { PIN_HEIGHT, PIN_WIDTH } from './helper';
import { IPin } from './types';

export const Pin: React.FC<IPin> = ({
  type,
  showHighlightShadow = false,
  color,
  fullColor,
  width = PIN_WIDTH,
  height = PIN_HEIGHT,
  cursor = true,
  badge,
  pinDiskProps,
  singleServiceMRColors,
  border,
}) => {
  if (!singleServiceMRColors?.length) {
    return (
      <DefaultPin
        type={type}
        showHighlightShadow={showHighlightShadow}
        color={color}
        fullColor={fullColor}
        badge={badge}
        width={width}
        height={height}
        border={border}
      />
    );
  }

  if (pinDiskProps && singleServiceMRColors.length) {
    return (
      <PinDisk
        width={width}
        height={height}
        cursor={cursor}
        showHighlightShadow={showHighlightShadow}
        singleServiceMRColors={singleServiceMRColors}
        pinDiskProps={pinDiskProps}
      />
    );
  }

  return null;
};
