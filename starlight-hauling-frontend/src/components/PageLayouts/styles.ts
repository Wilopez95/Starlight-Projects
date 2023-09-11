import styled from 'styled-components';

export const PageLayout = styled.div`
  width: 100%;
  height: 100%;
  max-width: 100vw;
  overflow: hidden;
`;

export const PageContainer = styled.div`
  display: flex;
  max-width: 100vw;
  overflow: hidden;
  max-height: calc(100vh - ${p => p.theme.sizes.headerHeight});
  height: 100%;
  width: 100%;
`;
