import styled, { css } from 'styled-components';

import { IBadgeLayout } from './types';

export const Badge = styled.div<IBadgeLayout>`
  display: inline-block;
  text-align: center;
  text-transform: capitalize;
  color: ${props => props.theme.colors[props.color][props.shade]};
  background-color: ${props => props.theme.colors[props.bgColor][props.bgShade]};
  ${props =>
    props.borderRadius &&
    css`
      border-radius: ${props.borderRadius}px;
    `};
`;
