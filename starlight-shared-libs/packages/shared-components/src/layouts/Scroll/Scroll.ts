import styled, { css } from 'styled-components';

import { ILayoutScrollProps } from './types';

export const Scroll = styled.div<ILayoutScrollProps>`
  width: ${props => (props.width ? `${props.width}px` : '100%')};
  height: ${props => (props.height ? `${props.height}px` : '100%')};
  max-height: ${props => (props.maxHeight ? `${props.maxHeight}px` : 'unset')};
  min-height: ${props => (props.minHeight ? `${props.minHeight}px` : 'unset')};

  ${props =>
    props.scrollReverse &&
    css`
      display: flex;
      justify-content: flex-start;
      flex-flow: column-reverse nowrap;
    `}

  /** Firefox */
  scrollbar-width: thin;
  scrollbar-color: ${props =>
    `${props.theme.colors.secondary.desaturated!} ${props.theme.colors.white.desaturated!}`};

  /** IOS */
  -webkit-overflow-scrolling: touch;

  position: relative;
  overflow-y: ${props => props.overflowY ?? 'auto'};
  overflow-x: ${props => props.overflowX ?? 'hidden'};
  overscroll-behavior: ${props => props.overscrollBehavior ?? 'initial'};

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;

    &-track {
      border-radius: ${props => (props.rounded ? '3px' : 'unset')};
      background-color: ${props => props.theme.colors.white.desaturated};
    }

    &-thumb {
      border-radius: ${props => (props.rounded ? '3px' : 'unset')};
      background-color: ${props => props.theme.colors.secondary.desaturated};
    }

    &-button:single-button:vertical {
      &:decrement,
      &:increment {
        display: none;
      }
    }

    &-corner {
      background-color: ${props => props.theme.colors.white.desaturated};
    }
  }
`;
