import { Layouts } from '@starlightpro/shared-components';
import styled, { css } from 'styled-components';

interface IStyledOptionProps {
  disabled?: boolean;
  footer?: boolean;
  borderVariant?: 'top' | 'bottom' | 'both' | 'none';
}

export const StyledRedirectButton = styled.div`
  min-width: 156px;
  opacity: 0;

  &:focus,
  &:hover {
    opacity: 0.9;
  }
`;

export const StyledOption = styled(Layouts.Padding)<IStyledOptionProps>`
  ${({ borderVariant = 'bottom' }) => {
    switch (borderVariant) {
      case 'bottom': {
        return css`
          border-bottom: 1px solid ${(p) => p.theme.colors.grey.standard};
        `;
      }
      case 'top': {
        return css`
          border-top: 1px solid ${(p) => p.theme.colors.grey.standard};
        `;
      }
      case 'both': {
        return css`
          border-bottom: 1px solid ${(p) => p.theme.colors.grey.standard};
          border-top: 1px solid ${(p) => p.theme.colors.grey.standard};
        `;
      }
    }
  }}

  cursor: pointer;
  list-style: none;

  &:hover,
  &:focus.optionItem,
  &[aria-selected='true'] {
    box-shadow: inset 2px 0 0 0 ${(p) => p.theme.colors.primary.standard};
    background-color: ${(p) => p.theme.colors.grey.desaturated};
  }

  ${(p) =>
    p.disabled &&
    css`
      color: ${(p) => p.theme.colors.grey.desaturated};

      &:hover {
        box-shadow: none;
        background-color: transparent;
        cursor: not-allowed;
      }
    `}

  ${(p) =>
    p.footer &&
    css`
      background-color: ${(p) => p.theme.colors.grey.desaturated};
    `}

    &:hover  ${StyledRedirectButton} {
    opacity: 1;
  }
`;
