import { IConfigurableOrder } from '@root/types';

import { IOrderDetailsComponent } from '../../types';

export interface IButtons extends IOrderDetailsComponent {
  onSubmit(callback: (data: IConfigurableOrder) => Promise<void>): void;
}
