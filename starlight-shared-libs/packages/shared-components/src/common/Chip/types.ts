import { SvgComponent } from '../../types/base';

export interface IChip {
  children: React.ReactText;
  icon?: SvgComponent;
  onIconClick?(): void;
}
