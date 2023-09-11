import styled from 'styled-components';

import { ILayoutScrollProps } from './types';

export const Scroll = styled.div<ILayoutScrollProps>`
  width: ${(p) => (p.width ? `${p.width}px` : '100%')};
  height: ${(p) => (p.height ? `${p.height}px` : '100%')};
  max-height: ${(p) => (p.maxHeight ? `${p.maxHeight}px` : 'unset')};

  /** Firefox */
  scrollbar-width: thin;
  scrollbar-color: ${(p) =>
    `${p.theme.colors.secondary.desaturated!} ${p.theme.colors.white.desaturated!}`};

  /** IOS */
  -webkit-overflow-scrolling: touch;

  position: relative;
  overflow-y: ${(p) => p.overflowY ?? 'auto'};
  overflow-x: ${(p) => p.overflowX ?? 'hidden'};
  overscroll-behavior: ${(p) => p.overscrollBehavior ?? 'initial'};

  &::-webkit-scrollbar {
    width: 6px;

    &-track {
      border-radius: ${(p) => (p.rounded ? '3px' : 'unset')};
      background-color: ${(p) => p.theme.colors.white.desaturated};
    }

    &-thumb {
      border-radius: ${(p) => (p.rounded ? '3px' : 'unset')};
      background-color: ${(p) => p.theme.colors.secondary.desaturated};
    }

    &-button:single-button:vertical {
      &:decrement,
      &:increment {
        display: none;
      }
    }
  }
`;
