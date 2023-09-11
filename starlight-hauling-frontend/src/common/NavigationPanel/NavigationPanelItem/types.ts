import { NavLinkProps } from 'react-router-dom';
import { Colors } from '@starlightpro/shared-components';

import { SvgComponent } from '@root/types';

export interface INavigationPanelItem {
  active?: boolean;
  icon?: SvgComponent;
  title?: string;
  badge?: string | number | null;
  badgeColor?: Colors;
  inner?: boolean;
  to?: string;
  exact?: boolean;
  onClick?: () => void;
  isActive?: NavLinkProps['isActive'];
}
