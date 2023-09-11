import styled from 'styled-components';

import { IMarginLayout } from './types';

export const Margin = styled.div<IMarginLayout>`
  ${props => props.margin && `margin: ${props.theme.offsets[props.margin]}`};
  ${props => props.top && `margin-top: ${props.theme.offsets[props.top]}`};
  ${props => props.right && `margin-right: ${props.theme.offsets[props.right]}`};
  ${props => props.bottom && `margin-bottom: ${props.theme.offsets[props.bottom]}`};
  ${props => props.left && `margin-left: ${props.theme.offsets[props.left]}`};
`;
