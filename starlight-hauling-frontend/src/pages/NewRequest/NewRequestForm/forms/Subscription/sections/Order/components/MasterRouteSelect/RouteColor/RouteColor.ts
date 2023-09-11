import styled from 'styled-components';

import { IRouteColor } from './types';

export const RouteColor = styled.div<IRouteColor>`
  border-radius: 2px;
  width: 12px;
  height: 12px;
  background-color: ${({ color }) => color};
`;
