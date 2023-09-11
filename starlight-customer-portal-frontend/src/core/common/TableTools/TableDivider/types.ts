import { Colors, IThemeColor } from '@starlightpro/shared-components';

export interface IDivider {
  top?: boolean;
  bottom?: boolean;
  both?: boolean;
  className?: string;
  colSpan?: number;
  color?: Colors;
  shade?: keyof IThemeColor;
}
