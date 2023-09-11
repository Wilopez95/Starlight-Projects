import { ArrowIcon } from '@starlightpro/shared-components';
import styled, { css } from 'styled-components';

interface ISortableHeaderCellStyledProps {
  full: boolean;
  sortable: boolean;
  width?: string | number;
  height?: string | number;
}
export const SortableHeaderCellStyled = styled.th<ISortableHeaderCellStyledProps>`
  width: ${(p) => p.width ?? 'unset'};
  height: ${(p) => p.height ?? 'unset'};

  ${(p) =>
    p.sortable &&
    css`
      cursor: pointer;
      user-select: none;
    `}
`;

export interface IArrowStyledProps {
  desc: boolean;
  hidden: boolean;
  asc: boolean;
}

export const ArrowStyled = styled(ArrowIcon)<IArrowStyledProps>`
  width: 10px !important;
  transition: transform 300ms ease, opacity 300ms ease;

  & path {
    fill: var(--caption-dark) !important;
  }

  ${(p) =>
    p.hidden &&
    css`
      opacity: 0;
    `};

  ${(p) =>
    p.asc &&
    css`
      transform: rotate(180deg);
    `};

  ${(p) =>
    p.desc &&
    css`
      transform: rotate(0deg);
    `};
`;
