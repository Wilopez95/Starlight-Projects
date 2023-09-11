import React from 'react';

import { StyledDivider } from './styles';
import { IDivider } from './types';

export const Divider: React.FC<IDivider> = ({
  top,
  bottom,
  both,
  className,
  colSpan,
  color,
  shade,
}) => {
  return colSpan ? (
    <tr>
      <td colSpan={colSpan}>
        <StyledDivider
          top={top}
          bottom={bottom}
          both={both}
          color={color}
          shade={shade}
          className={className}
        />
      </td>
    </tr>
  ) : (
    <StyledDivider
      top={top}
      bottom={bottom}
      both={both}
      color={color}
      shade={shade}
      className={className}
    />
  );
};
