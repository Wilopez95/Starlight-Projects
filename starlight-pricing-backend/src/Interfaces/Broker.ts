import { IEntity } from './Entity';

export interface IBroker extends IEntity {
  name: string;
  email: string;
  active: boolean;
  shortName: string;
  billing: 'broker' | 'customer';
}
