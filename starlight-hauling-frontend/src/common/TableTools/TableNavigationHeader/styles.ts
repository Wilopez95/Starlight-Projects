import styled, { css } from 'styled-components';

import { ArrowIcon as BaseArrowIcon, FilterIcon as BaseFilterIcon } from '@root/assets';

export const FilterIcon = styled(BaseFilterIcon)<{ $active: boolean }>`
  fill: white !important;
  path {
    stroke: ${p => (p.$active ? p.theme.colors.primary.standard : p.theme.colors.secondary.dark)};
  }
`;

export const ArrowIcon = styled(BaseArrowIcon)<{ $active: boolean }>`
  width: 10px !important;
  transition: transform 300ms ease !important;
  transform: rotate(0deg);

  path {
    fill: ${p => p.theme.colors.secondary.dark} !important;
  }

  ${p =>
    p.$active &&
    css`
      transform: rotate(180deg);
    `}
`;
