import styled from 'styled-components';

import { TableScrollContainer } from '@root/core/common/TableTools';

const PageContainer = styled.div`
  box-shadow: 0 2px 8px 0 rgba(33, 43, 54, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ScrollContainer = styled(TableScrollContainer)`
  box-shadow: none;
`;

export default {
  PageContainer,
  ScrollContainer,
};
