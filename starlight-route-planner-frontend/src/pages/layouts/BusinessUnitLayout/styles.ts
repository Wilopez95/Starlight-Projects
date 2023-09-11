import styled from 'styled-components';

export const Layout = styled.div`
  display: flex;
  max-width: 100vw;
  overflow: hidden;
  max-height: calc(100vh - ${p => p.theme.sizes.headerHeight});
  height: 100%;
  width: 100%;
`;
