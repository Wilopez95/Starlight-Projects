import {
  CrossIcon as CrossIconBase,
  HomeYardPinIcon as HomeYardPinIconBase,
  LandfillPinIcon as LandfillPinIconBase,
  Layouts,
} from '@starlightpro/shared-components';
import styled from 'styled-components';

export const Modal = styled(Layouts.Flex)`
  width: auto;
  height: 100%;
  position: relative;
  cursor: default;
`;

export const TransparentBackground = styled(Layouts.Box)`
  position: absolute;
  width: stretch;
  height: stretch;
  background-color: grey;
  opacity: 50%;
  cursor: default;
`;

export const Box = styled(Layouts.Box)`
  z-index: 1;
  width: 60%;
  max-width: 500px;
  background-color: white;
`;

export const CrossIcon = styled(CrossIconBase)`
  cursor: pointer;
  margin-left: auto;
`;

export const LandfillPinIcon = styled(LandfillPinIconBase)`
  width: 34px;
  height: 31px;
`;

export const HomeYardPinIcon = styled(HomeYardPinIconBase)`
  width: 34px;
  height: 31px;
`;
