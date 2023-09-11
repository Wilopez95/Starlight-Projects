import React from 'react';
// We have to use theme here directly because ThemeProvider is not available here.
import { haulingTheme } from '@starlightpro/shared-components';
import styled, { css } from 'styled-components';

import { MarkerIcon, MarkerWithTextIcon } from '@root/assets';

import { IStyledMarker } from './types';

export const StyledMarker = styled<React.FC<IStyledMarker>>(MarkerIcon)`
  cursor: pointer;
  display: block;
  width: 37px;
  height: 52px;

  ${props =>
    props.$selected &&
    css`
      transform: scale(1.5);
    `}

  ${({ $color }) =>
    $color &&
    css`
      path {
        fill: ${$color};
      }
    `}
`;

export const MarkerAndTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const StyledMarkerWithText = styled<React.FC<IStyledMarker>>(MarkerWithTextIcon)`
  cursor: pointer;
  display: block;
  width: 23px;
  height: 33px;

  ${props =>
    props.$selected &&
    css`
      transform: scale(1.5);
    `}
`;

export const MarkerText = styled.div`
  color: white;
  text-align: center;
  border-radius: 8px;
  margin-top: 7px;
  padding: 1px 6px;
  background: ${haulingTheme.colors.secondary.standard};
`;
