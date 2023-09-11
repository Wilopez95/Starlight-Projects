import { Colors, IThemeColor } from '../../theme/baseTypes';

type BoxPosition = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';

export interface IBoxLayout {
  position?: BoxPosition;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  borderRadius?: string;
  as?: 'div' | 'span' | 'button' | 'table';
  backgroundColor?: Colors;
  backgroundShade?: keyof IThemeColor;

  borderWidth?: string;
  borderColor?: Colors;
  borderShade?: keyof IThemeColor;
  float?: 'left' | 'right';
  className?: string;
  overflowHidden?: boolean;
  flexShrink?: string;
}
