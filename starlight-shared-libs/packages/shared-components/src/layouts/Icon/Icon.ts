import styled, { css } from 'styled-components';

import { IIconLayout } from './types';

export const IconLayout = styled.span<IIconLayout>`
  cursor: ${({ cursor = 'pointer', disabled }) => (disabled ? 'not-allowed' : cursor)};
  margin-right: ${props => props.theme.offsets[props.right ?? '1']};
  opacity: ${({ opacity }) => opacity ?? 1};

  & svg {
    width: ${({ width }) => width ?? '20px'};
    height: ${({ height }) => height ?? '20px'};
  }

  ${({ theme, disableFill, color = 'secondary', shade = 'desaturated' }) =>
    !disableFill &&
    css`
      & path {
        fill: ${theme.colors[color][shade]};
      }
    `}

  ${({ remove, theme, disabled }) =>
    remove &&
    css`
      & path {
        fill: ${theme.colors.secondary.desaturated};
        ${!disabled &&
        css`
          &:hover {
            fill: ${theme.colors.alert.dark};
          }
        `}
      }
    `}
`;
