// TODO find better way with ITheme for custom styled components (images)
import {
  ArrowIcon as BaseArrowIcon,
  Colors,
  FilterIcon as BaseFilterIcon,
  IThemeColor,
} from '@starlightpro/shared-components';
import styled, { css } from 'styled-components';

export const FilterIcon = styled(BaseFilterIcon as React.FC)<{
  $active: boolean;
}>`
  fill: white !important;
  path {
    stroke: ${p => (p.$active ? p.theme.colors.primary.standard : p.theme.colors.secondary.light)};
  }
`;

export const ArrowIcon = styled(BaseArrowIcon as React.FC)<{
  $active: boolean;
  color?: Colors;
  shade?: keyof IThemeColor;
}>`
  width: 10px !important;
  transition: transform 300ms ease !important;
  transform: rotate(0deg);

  path {
    fill: ${p => p.theme.colors[p.color ?? 'secondary'][p.shade ?? 'dark']} !important;
  }

  ${p =>
    p.$active &&
    css`
      transform: rotate(180deg);
    `}
`;
