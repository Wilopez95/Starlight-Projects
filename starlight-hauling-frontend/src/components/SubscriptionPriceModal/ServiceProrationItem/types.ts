import { IBillableService } from '@root/types';

import { IProrationItemComponent } from '../ProrationItem/types';

export interface IServiceProrationItemComponent extends Omit<IProrationItemComponent, 'name'> {
  billableService?: IBillableService;
}
