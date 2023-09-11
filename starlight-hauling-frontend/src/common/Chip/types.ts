import { SvgComponent } from '@root/types';

export interface IChip {
  children: React.ReactText;
  icon?: SvgComponent;
  onIconClick?(e: React.MouseEvent<HTMLElement>): void;
}
