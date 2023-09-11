import React, { SVGProps } from 'react';
import styled, { css } from 'styled-components';

import { ApproveIcon, ArrowIcon } from '@root/assets';

export const StyledArrow = styled<React.FC<SVGProps<HTMLOrSVGElement> & { open?: boolean }>>(
  ArrowIcon,
)`
  width: 10px;
  margin-left: 10px;
  margin-right: 10px;
  transition: transform 300ms ease-in-out;

  ${props =>
    !props.open &&
    css`
      transform: rotate(180deg);
    `}
`;

export const HasPermissionsIcon = styled<React.FC<SVGProps<HTMLOrSVGElement>>>(ApproveIcon)`
  path {
    fill: ${p => p.theme.colors.success.standard};
  }
`;
