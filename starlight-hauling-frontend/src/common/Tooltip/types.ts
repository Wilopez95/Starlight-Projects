import { ReactNode } from 'react';
import { Colors, IThemeColor } from '@starlightpro/shared-components';

export interface ITooltip {
  children: ReactNode;
  text: ReactNode;
  delay?: number;
  wrapperClassName?: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
  fullWidth?: boolean;
  border?: boolean;
  borderColor?: Colors;
  borderShade?: keyof IThemeColor;
  normalizeTypography?: boolean;
  inline?: boolean;
  marker?: string;
}

export interface ITooltipLayout {
  hidden: boolean;
  posX: string;
  posY: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
}
