import { IEntity } from './entity';

export interface I3pHauler extends IEntity {
  id: number;
  description: string;
  active: boolean;
}
