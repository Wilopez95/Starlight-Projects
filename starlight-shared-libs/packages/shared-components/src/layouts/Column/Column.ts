import styled from 'styled-components';

import { IColumnLayout } from './types';

export const Column = styled.div<IColumnLayout>`
  width: ${props =>
    `calc(50% - ${props.single ? '0px' : props.theme.offsets[props.padding ?? '2']})`};

  &:nth-child(odd) {
    margin-right: ${props => (props.single ? 0 : props.theme.offsets[props.padding ?? '2'])};
  }

  &:nth-child(even) {
    margin-left: ${props => (props.single ? 0 : props.theme.offsets[props.padding ?? '2'])};
  }
`;
