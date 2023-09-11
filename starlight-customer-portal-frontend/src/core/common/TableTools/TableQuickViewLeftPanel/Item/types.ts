import { IBaseComponent } from '@root/core/types';

export interface IItem extends IBaseComponent {
  inline?: boolean;
  editable?: boolean;
  onClick?(): void;
}
