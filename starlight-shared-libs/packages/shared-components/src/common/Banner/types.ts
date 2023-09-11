import { Colors } from '../../theme/baseTypes';

export interface IBanner {
  removable?: boolean;
  color?: Colors;
  showIcon?: boolean;
  className?: string;
  textVariant?:
    | 'headerOne'
    | 'headerTwo'
    | 'headerThree'
    | 'headerFour'
    | 'headerFive'
    | 'bodyLarge'
    | 'bodyMedium'
    | 'bodySmall'
    | 'caption';
}
