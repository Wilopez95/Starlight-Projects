import { Colors, FontWeightUnit, IThemeColor } from '../../theme/baseTypes';

export type TextTransform = 'capitalize' | 'lowercase' | 'uppercase' | 'none';
export type TextAlign = 'left' | 'right' | 'center';
export type Variant =
  | 'headerOne'
  | 'headerTwo'
  | 'headerThree'
  | 'headerFour'
  | 'headerFive'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'caption';
export interface ITypographyLayout {
  color?: Colors;
  shade?: keyof IThemeColor;
  cursor?: 'pointer' | 'not-allowed' | 'auto';
  fontWeight?: FontWeightUnit;
  underlined?: boolean;
  htmlFor?: string;
  className?: string;
  textTransform?: TextTransform;
  textAlign?: TextAlign;
  variant?: Variant;
  as?: 'span' | 'div' | 'label' | 'h1' | 'td';
  ellipsis?: boolean;
  disabled?: boolean;
  textDecoration?: 'blink' | 'line-through' | 'overline' | 'underline' | 'underline dotted';
  onClick?(event: any): void;
}
