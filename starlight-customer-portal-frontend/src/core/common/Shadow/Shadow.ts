import styled from 'styled-components';

import { IShadowLayout } from './types';

export const Shadow = styled.div<IShadowLayout>`
  box-shadow: ${(props) => props.theme.shadows[props.variant]};
`;
