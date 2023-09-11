import { Colors, IThemeColor } from '../../theme/baseTypes';

export interface IBadge {
  color?: Colors;
  bgColor?: Colors;
  shade?: keyof IThemeColor;
  bgShade?: keyof IThemeColor;
  className?: string;
  borderRadius?: number;
  textTransform?: 'capitalize' | 'lowercase' | 'uppercase' | 'none';
}
