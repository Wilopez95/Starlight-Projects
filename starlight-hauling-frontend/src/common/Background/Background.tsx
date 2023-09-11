import styled from 'styled-components';

export const Background = styled.div`
  position: absolute;
  height: calc(100vh - ${p => p.theme.sizes.headerHeight});
  width: 100vw;
  transition: opacity 300ms ease;
  left: 0;
  top: ${p => p.theme.sizes.headerHeight};
  background-color: black;
  opacity: 0.3;
  z-index: 3;
  cursor: pointer;
`;
