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

export const ListItem = styled(Layouts.Flex)`
  padding: 16px 0px 14px 0px;
  box-shadow: inset 0px -1px 0px #dfe3e8;
  cursor: pointer;
`;

export const Row = styled(Layouts.Flex)`
  width: 100%;
`;

export const CountBlock = styled.div`
  background: #919eab;
  border-radius: 8px;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 14px;
  color: #ffffff;
  padding: 1px 6px;
`;

export const Header = styled(Layouts.Flex)`
  box-shadow: inset 0px -1px 0px #dfe3e8;
  padding-bottom: 16px;
`;

export const EditedLabel = styled.span`
  font-size: 14px;
  line-height: 20px;
  color: #919eab;
`;
