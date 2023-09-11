import { Colors, IThemeColor, OffsetUnit } from '../../theme/baseTypes';

export interface IIconLayout {
  width?: string;
  height?: string;
  right?: OffsetUnit;
  opacity?: number;
  remove?: boolean;
  color?: Colors;
  shade?: keyof IThemeColor;
  readOnly?: boolean;
  cursor?: 'pointer' | 'not-allowed';
  disableFill?: boolean;
  disabled?: boolean;
}
