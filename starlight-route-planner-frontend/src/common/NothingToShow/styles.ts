import {
  CrossIcon as CrossIconBase,
  Layouts,
  NoResultIcon as NoResultIconBase,
  SearchIcon as SearchIconBase,
  Typography as TypographyBase,
} from '@starlightpro/shared-components';
import styled from 'styled-components';

export const SidebarWrapper = styled(Layouts.Flex)`
  height: 100%;
`;

export const Typography = styled(TypographyBase)`
  color: var(--secondary-gray);
`;

export const MapLabelWrapper = styled(Layouts.Box)`
  display: flex;
  padding: 0 2rem;
  box-shadow: inset 0px -1px 0px rgba(0, 0, 0, 0.1);
`;

export const MapLabelContentWrapper = styled(Layouts.Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  justify-content: center;
`;

export const SearchIcon = styled(SearchIconBase)`
  height: 18px;
  width: 18px;

  path {
    fill: #e27900;
  }
`;

export const CrossIcon = styled(CrossIconBase)`
  position: absolute;
  height: 8px;
  width: 8px;
  stroke: var(--caption-dark);
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
`;

export const NoResultIcon = styled(NoResultIconBase)`
  width: 142px;
  height: 142px;
`;
