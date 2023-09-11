import { Colors } from '@starlightpro/shared-components';

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
  onEdit?(): void;
}
