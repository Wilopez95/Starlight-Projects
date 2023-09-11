import { ReactNode } from 'react';
import { Colors, IThemeColor } from '@starlightpro/shared-components';

export interface IValidationBlock {
  children?: string | ReactNode;
  color?: Colors;
  shade?: keyof IThemeColor;
  textColor?: Colors;
  borderRadius?: string;
  width?: string;
}
