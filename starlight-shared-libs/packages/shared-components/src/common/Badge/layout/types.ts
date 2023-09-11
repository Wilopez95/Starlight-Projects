import { Colors, IThemeColor } from '../../../theme/baseTypes';

export interface IBadgeLayout {
  color: Colors;
  shade: keyof IThemeColor;
  bgColor: Colors;
  bgShade: keyof IThemeColor;
  className?: string;
  borderRadius?: number;
  textTransform?: 'capitalize' | 'lowercase' | 'uppercase' | 'none';
}
