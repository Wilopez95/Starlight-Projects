import { IEntity } from './entity';

export interface ICustomerGroup extends IEntity {
  description: string;
  active: boolean;
  type: CustomerGroupType;
}

export enum CustomerGroupType {
  commercial = 'commercial',
  nonCommercial = 'non-commercial',
}
