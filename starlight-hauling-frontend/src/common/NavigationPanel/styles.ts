import styled from 'styled-components';

export const NavigationPanelContainer = styled.aside`
  width: ${p => p.theme.sizes.navigationPanelWidth};
  max-height: calc(100vh - ${p => p.theme.sizes.headerHeight});
  height: 100%;
`;
