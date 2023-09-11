import {
  CrossIcon as CrossIconBase,
  Layouts,
  Navigation,
  Typography,
} from '@starlightpro/shared-components';
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

export const Link = styled.a`
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: #006fbb;
`;

export const ServiceItemInfoWrapper = styled(Box)`
  max-width: 300px;
`;

export const TabTitleMark = styled(Typography)`
  line-height: 0.5rem;
`;

export const PopupContentWrapper = styled(Box)`
  min-height: 440px;
  min-width: 370px;
`;

export const VerticalNavigation = styled(Navigation)`
  & > div {
    height: auto !important;
    min-height: 34px;
  }
`;
