import styled, { css } from 'styled-components';

import { IBoxLayout } from './types';

export const Box = styled.div<IBoxLayout>`
  position: ${({ position = 'static' }) => `${position}`};
  ${({ theme, backgroundColor, backgroundShade }) =>
    backgroundColor &&
    css`
      background-color: ${theme.colors[backgroundColor][backgroundShade ?? 'standard']};
    `};
  ${({ borderRadius }) =>
    borderRadius &&
    css`
      border-radius: ${borderRadius};
    `};
  ${({ width }) =>
    width &&
    css`
      width: ${width};
    `};
  ${({ minWidth }) =>
    minWidth &&
    css`
      min-width: ${minWidth};
    `};
  ${({ maxWidth }) =>
    maxWidth &&
    css`
      max-width: ${maxWidth};
    `};
  ${({ height }) =>
    height &&
    css`
      height: ${height};
    `};
  ${({ minHeight }) =>
    minHeight &&
    css`
      min-height: ${minHeight};
    `};
  ${({ maxHeight }) =>
    maxHeight &&
    css`
      max-height: ${maxHeight};
    `};
  ${({ top }) =>
    top &&
    css`
      top: ${top};
    `};
  ${({ bottom }) =>
    bottom &&
    css`
      bottom: ${bottom};
    `};
  ${({ left }) =>
    left &&
    css`
      left: ${left};
    `};
  ${({ right }) =>
    right &&
    css`
      right: ${right};
    `};
  ${({ float }) =>
    float &&
    css`
      float: ${float};
    `};
  ${({ overflowHidden }) =>
    overflowHidden &&
    css`
      overflow: hidden;
    `};
  ${({ flexShrink }) =>
    flexShrink &&
    css`
      flex-shrink: ${flexShrink};
    `}
`;
