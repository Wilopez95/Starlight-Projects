import { Layouts, RoutesIcon as RoutesIconBase } from '@starlightpro/shared-components';
import styled from 'styled-components';

export const RoutesIcon = styled(RoutesIconBase)`
  margin-right: 12px;
`;

export const RoutesCountText = styled.span`
  position: relative;
  margin-left: 20px;

  &::before {
    content: '';
    display: block;
    position: absolute;
    left: -12px;
    top: 36%;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: #212b36;
  }
`;

export const Header = styled(Layouts.Flex)`
  box-shadow: inset 0px -1px 0px #dfe3e8;
  padding-bottom: 16px;
`;
