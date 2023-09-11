/* eslint-disable default-case */
import styled, { css } from 'styled-components';

import { Layouts } from '../../../../layouts';
import { StyledRedirectButton } from '../RedirectButton/styles';

interface IStyledOptionProps {
  disabled?: boolean;
  footer?: boolean;
  borderVariant?: 'top' | 'bottom' | 'both' | 'none';
  isFocused?: boolean;
}

export const StyledOption = styled(Layouts.Padding)<IStyledOptionProps>`
  ${({ borderVariant = 'bottom' }) => {
    switch (borderVariant) {
      case 'bottom': {
        return css`
          border-bottom: 1px solid ${props => props.theme.colors.grey.standard};
        `;
      }
      case 'top': {
        return css`
          border-top: 1px solid ${props => props.theme.colors.grey.standard};
        `;
      }
      case 'both': {
        return css`
          border-bottom: 1px solid ${props => props.theme.colors.grey.standard};
          border-top: 1px solid ${props => props.theme.colors.grey.standard};
        `;
      }
      case 'none': {
        return css`
          border-bottom: 0;
          border-top: 0;
        `;
      }
    }
  }}

  cursor: pointer;
  list-style: none;

  &:hover,
  &:focus.optionItem,
  &[aria-selected='true'] {
    box-shadow: inset 2px 0 0 0 ${props => props.theme.colors.primary.standard};
    background-color: ${props => props.theme.colors.grey.desaturated};
  }

  ${props =>
    props.disabled &&
    css`
      color: ${props => props.theme.colors.grey.desaturated};

      &:hover {
        box-shadow: none;
        background-color: transparent;
        cursor: not-allowed;
      }
    `}

  ${props =>
    props.isFocused &&
    css`
      box-shadow: inset 2px 0 0 0 ${props => props.theme.colors.primary.standard};
      background-color: ${props => props.theme.colors.grey.standard} !important;
    `}

  ${props =>
    props.footer &&
    css`
      background-color: ${props => props.theme.colors.grey.desaturated};
    `}

    &:hover  ${StyledRedirectButton} {
    opacity: 1;
  }
`;
