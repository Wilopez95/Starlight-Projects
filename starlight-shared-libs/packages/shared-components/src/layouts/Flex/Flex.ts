import styled, { css } from 'styled-components';

import { IFlexLayout } from './types';

export const Flex = styled.div<IFlexLayout>`
  display: flex;
  align-items: ${props => props.alignItems ?? 'normal'};
  justify-content: ${props => props.justifyContent ?? 'normal'};
  flex-grow: ${props => props.flexGrow ?? 0};
  flex-direction: ${props => props.direction ?? 'row'};

  ${({ $wrap }) =>
    $wrap &&
    css`
      flex-wrap: wrap;
    `};

  ${({ gap }) =>
    gap &&
    css`
      gap: ${gap};
    `};
`;
