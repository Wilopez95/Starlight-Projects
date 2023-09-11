import styled from 'styled-components';

export const NavigationPanelContainer = styled.aside`
  width: ${props => props.theme.sizes.navigationPanelWidth};
  max-height: calc(100vh - ${props => props.theme.sizes.headerHeight});
  height: 100%;
`;
