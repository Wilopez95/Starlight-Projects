import styled, { css } from 'styled-components';

import { Colors } from '../../theme/baseTypes';

export const Hover = styled.div<{ color: Colors }>`
  ${({ color }) =>
    color &&
    css`
      &:hover,
      &:focus {
        div {
          color: ${color};
        }
        svg path {
          fill: ${color};
        }
      }
    `};
`;
