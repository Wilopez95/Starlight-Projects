import { Layouts } from '@starlightpro/shared-components';
import styled from 'styled-components';

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
