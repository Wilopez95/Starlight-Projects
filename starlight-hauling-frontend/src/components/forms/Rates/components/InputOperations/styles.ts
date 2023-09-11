import styled, { css } from 'styled-components';

interface IOperationButton {
  active?: boolean;
  plus?: boolean;
}

export const OperationButton = styled.button<IOperationButton>`
  position: relative;
  display: block;
  padding: 0;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: solid 1px ${p => p.theme.colors.grey.dark};
  background: white;
  font-size: 16px;

  /** @ArtemMalysh Please add normal focus styles for this component */
  &:focus {
    outline: 1px solid ${p => p.theme.colors.primary.standard};
  }

  &::after,
  &::before {
    content: '';
    display: block;
    background-color: ${p => p.theme.colors.secondary.light};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
  }

  &::before {
    height: 2px;
    width: 6px;
  }

  ${p1 =>
    p1.active &&
    css`
      background: ${p2 => p2.theme.colors.primary.standard};
      border: none;

      &::after,
      &::before {
        background: white;
      }

      &[disabled] {
        background: ${p => p.theme.colors.secondary.light};
      }
    `}

  &[disabled] {
    &::after,
    &::before {
      background: ${p => p.theme.colors.grey.standard};
    }
  }

  ${p =>
    p.plus &&
    css`
      &::after {
        height: 6px;
        width: 2px;
      }
      margin-bottom: 4px;
    `}
`;
