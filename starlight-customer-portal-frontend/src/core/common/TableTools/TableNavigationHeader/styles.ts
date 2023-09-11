import {
  ArrowIcon as BaseArrowIcon,
  FilterIcon as BaseFilterIcon,
  ITheme,
} from '@starlightpro/shared-components';
import styled, { css } from 'styled-components';

export const FilterIcon = styled(BaseFilterIcon)<{ active: boolean }>`
  fill: white !important;
  path {
    stroke: ${(p: { theme: ITheme; active: boolean }) =>
      p.active ? p.theme.colors.primary.standard : p.theme.colors.secondary.desaturated};
  }
`;

export const ArrowIcon = styled(BaseArrowIcon)<{ active: boolean }>`
  width: 10px !important;
  transition: transform 300ms ease !important;
  transform: rotate(0deg);

  path {
    fill: ${(p: { theme: ITheme }) => p.theme.colors.secondary.dark} !important;
  }

  ${(p) =>
    p.active &&
    css`
      transform: rotate(180deg);
    `}
`;
