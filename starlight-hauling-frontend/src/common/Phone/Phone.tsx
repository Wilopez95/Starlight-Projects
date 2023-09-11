import React, { useCallback } from 'react';

import { Typography } from '../Typography/Typography';

export const Phone: React.FC<{ number: string | number }> = ({ number }) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLOrSVGElement, MouseEvent>) => {
    e.stopPropagation();
  }, []);

  return (
    <div onClick={handleClick}>
      <a href={`tel:${number}`}>
        <Typography variant="bodySmall" color="information">
          {number}
        </Typography>
      </a>
    </div>
  );
};
