import styled, { css } from 'styled-components';

import { ArrowIcon } from '@root/assets';

interface ISortableCellContainerProps {
  center?: boolean;
  right?: boolean;
}

export const SortableCellContainer = styled.div<ISortableCellContainerProps>`
  margin: 10px 24px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-transform: capitalize;

  ${p =>
    p.center &&
    css`
      justify-content: center;
    `}

  ${p =>
    p.right &&
    css`
      flex-direction: row-reverse;
      justify-content: flex-start;

      & svg {
        margin-left: 0;
        margin-right: 10px;
      }
    `}

 
  & svg {
    margin-left: 10px;
  }
`;

interface ISortableHeaderCellStyledProps {
  width?: string | number;
  height?: string | number;
}
export const SortableHeaderCellStyled = styled.th<ISortableHeaderCellStyledProps>`
  width: ${p => p.width ?? 'unset'};
  height: ${p => p.height ?? 'unset'};
  // we need transparent border in order when we are switching betweeen
  // sortable cells using "Tab" keyword it was moving, but not with transparent border
  border: 2px solid transparent;
  :focus-visible {
    border: 2px solid #f5a623;
  }
  cursor: pointer;
  user-select: none;
`;

export interface IArrowStyledProps {
  $desc: boolean;
  $asc: boolean;
  $active: boolean;
}

export const ArrowStyled = styled(ArrowIcon)<IArrowStyledProps>`
  width: 10px !important;
  transition: transform 300ms ease, opacity 300ms ease;
  & path {
    fill: var(--caption-dark) !important;
  }

  opacity: ${p => (p.$active ? 1 : 0)};

  ${p =>
    p.$asc &&
    p.$active &&
    css`
      transform: rotate(180deg);
    `};

  ${p =>
    p.$desc &&
    p.$active &&
    css`
      transform: rotate(0deg);
    `};
`;
