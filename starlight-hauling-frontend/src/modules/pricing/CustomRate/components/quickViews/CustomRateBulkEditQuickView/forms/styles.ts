import { IBoxLayout, Layouts } from '@starlightpro/shared-components';
import styled, { css } from 'styled-components';

interface IOperationButtonBox extends IBoxLayout {
  active?: boolean;
  plus?: boolean;
}

export const OperationButton = styled(Layouts.Box)<IOperationButtonBox>`
  display: block;
  border: solid 1px ${p => p.theme.colors.grey.dark};
  font-size: 1rem;

  &::after,
  &::before {
    content: '';
    display: block;
    background-color: ${props => props.theme.colors.secondary.desaturated};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &::before {
    height: 2px;
    width: 6px;
  }

  ${({ plus }) =>
    plus &&
    css`
      &::after {
        height: 6px;
        width: 2px;
      }
    `};

  ${({ active, theme }) =>
    active &&
    css`
      background-color: ${theme.colors.grey.dark};
    `};
`;
