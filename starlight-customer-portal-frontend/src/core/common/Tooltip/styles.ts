import { Layouts, Typography } from '@starlightpro/shared-components';
import styled, { css } from 'styled-components';

import { ITooltipLayout } from './types';

export const Container = styled(Layouts.Box)<{ fullWidth?: boolean; withBorder?: boolean }>`
  display: inline-block;
  transform: translateY(-5%);
  border-radius: 50%;

  ${({ withBorder, theme }) =>
    withBorder &&
    css`
      border: 1px solid ${theme.colors.secondary.desaturated ?? theme.colors.secondary.standard};
    `};

  ${(props) =>
    props.fullWidth &&
    css`
      width: 100%;
    `}

  ${Typography} {
    line-height: normal;
    letter-spacing: normal;
  }
`;

export const TooltipLayout = styled.div<ITooltipLayout>`
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  padding: 8px;
  background-color: ${(props) => props.theme.colors.secondary.dark};
  color: ${(props) => props.theme.colors.white.standard};
  border-radius: 7px;
  z-index: 1000;
  font-size: 14px;

  opacity: ${(props) => (props.hidden ? 0 : 1)};

  transition: opacity 300ms ease-in-out;

  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
  }

  ${(props) =>
    props.position === 'top' &&
    css`
      &::after {
        bottom: -5px;
        left: 50%;
        margin-left: -5px;
        border-width: 5px 5px 0;
        border-top-color: ${(props) => props.theme.colors.secondary.dark};
      }
    `}

  ${(props) =>
    props.position === 'bottom' &&
    css`
      &::after {
        top: 0;
        left: 50%;
        margin-left: -5px;
        margin-top: -5px;
        border-width: 0 5px 5px;
        border-bottom-color: ${(props) => props.theme.colors.secondary.dark};
      }
    `}

  ${(props) =>
    props.position === 'left' &&
    css`
      &::after {
        top: 50%;
        margin-top: -5px;
        border-width: 5px 0 5px 5px;
        border-left-color: ${(props) => props.theme.colors.secondary.dark};
        right: -5px;
        left: auto;
      }
    `}

  ${(props) =>
    props.position === 'right' &&
    css`
      &::after {
        top: 50%;
        left: 0;
        margin-left: -5px;
        margin-top: -5px;
        border-width: 5px 5px 5px 0;
        border-right-color: ${(props) => props.theme.colors.secondary.dark};
      }
    `}

  transform: ${(props) => `translate(${props.posX}, ${props.posY})`};
`;
