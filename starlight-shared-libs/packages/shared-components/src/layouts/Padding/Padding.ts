import styled from 'styled-components';

import { IPaddingLayout } from './types';

export const Padding = styled.div<IPaddingLayout>`
  ${props => props.padding && `padding: ${props.theme.offsets[props.padding]}`};
  ${props => props.top && `padding-top: ${props.theme.offsets[props.top]}`};
  ${props => props.right && `padding-right: ${props.theme.offsets[props.right]}`};
  ${props => props.bottom && `padding-bottom: ${props.theme.offsets[props.bottom]}`};
  ${props => props.left && `padding-left: ${props.theme.offsets[props.left]}`};
`;
