import styled from 'styled-components';

import { TableTools } from '@root/common/TableTools';

const PageContainer = styled.div`
  box-shadow: 0 2px 8px 0 rgba(33, 43, 54, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${p => p.theme.offsets[3]};
  padding-bottom: ${p => p.theme.offsets[2]};
  background-color: white;
  min-height: 85px;
  max-height: 85px;
`;

const ScrollContainer = styled(TableTools.ScrollContainer)`
  box-shadow: none;
`;

export default {
  PageContainer,
  TitleContainer,
  ScrollContainer,
};
