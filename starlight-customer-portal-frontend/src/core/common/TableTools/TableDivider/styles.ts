import { Colors, IThemeColor } from '@starlightpro/shared-components';
import styled, { css } from 'styled-components';

export interface IStyledDivider {
  top?: boolean;
  bottom?: boolean;
  both?: boolean;
  color?: Colors;
  shade?: keyof IThemeColor;
}

export const StyledDivider = styled.div<IStyledDivider>`
  width: 100%;
  border-width: 1px 0 0 0;
  border-style: solid;
  border-color: ${({ theme, shade = 'standard' }) => theme.colors['grey'][shade]};

  ${({ top }) =>
    top &&
    css`
      margin-top: 20px;
    `};
  ${({ bottom }) =>
    bottom &&
    css`
      margin-bottom: 20px;
    `};
  ${({ both }) =>
    both &&
    css`
      margin: 20px 0;
    `};
`;
