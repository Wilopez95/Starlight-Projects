import { IBaseComponent } from '@root/types';

export interface IItem extends IBaseComponent {
  inline?: boolean;
  editable?: boolean;
  onClick?(): void;
}
