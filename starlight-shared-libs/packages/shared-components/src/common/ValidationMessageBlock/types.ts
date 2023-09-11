import { ReactNode } from 'react';

import type { Colors, IThemeColor } from '../../';

export interface IValidationBlock {
  children: string | ReactNode;
  color?: Colors;
  shade?: keyof IThemeColor;
  textColor?: Colors;
  borderRadius?: string;
}
