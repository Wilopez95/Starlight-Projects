import React, { useState } from 'react';
import MuiTooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import TouchOutTooltipHandler from './TouchOutTooltipHandler';

export const Tooltip: React.FC<TooltipProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  return 'ontouchstart' in window ? (
    <TouchOutTooltipHandler
      onTouchStart={() => setIsOpen(true)}
      onTouchOut={() => setIsOpen(false)}
    >
      <MuiTooltip open={isOpen} {...props} />
    </TouchOutTooltipHandler>
  ) : (
    <MuiTooltip {...props} />
  );
};

export default Tooltip;
