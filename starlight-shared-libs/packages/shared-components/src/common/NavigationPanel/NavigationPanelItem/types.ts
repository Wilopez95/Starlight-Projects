import { NavLinkProps } from 'react-router-dom';

import { Colors } from '../../../theme/baseTypes';
import { SvgComponent } from '../../../types/base';

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
  external?: boolean;
}
