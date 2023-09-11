import { CrossIcon as CrossIconBase, Layouts } from '@starlightpro/shared-components';
import styled from 'styled-components';

export const CrossIcon = styled(CrossIconBase)`
  position: absolute;
  top: 15px;
  right: 15px;
  width: 10px;
  height: 10px;
  cursor: pointer;
  z-index: 100;
`;

export const Box = styled(Layouts.Box)`
  cursor: default;
`;
