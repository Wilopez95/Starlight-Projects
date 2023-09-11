import { IEntity } from './entity';

export interface ICustomerGroup extends IEntity {
  description: string;
  active: boolean;
  type: CustomerGroupType;
  spUsed: boolean;
}

export enum CustomerGroupType {
  commercial = 'commercial',
  nonCommercial = 'non-commercial',
  walkUp = 'walk-up',
}
