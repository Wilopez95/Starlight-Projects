import styled, { css } from 'styled-components';

export const Background = styled.div<{ expanded: boolean }>`
  position: absolute;
  opacity: 0;
  visibility: hidden;

  ${p =>
    p.expanded &&
    css`
      visibility: visible;
      transition: opacity 300ms ease;
      height: calc(100vh - ${p.theme.sizes.headerHeight});
      left: 0;
      width: 100vw;
      top: ${p.theme.sizes.headerHeight};
      background-color: black;
      opacity: 0.3;
      z-index: ${p.theme.zIndexes.overlay};
    `}
`;
