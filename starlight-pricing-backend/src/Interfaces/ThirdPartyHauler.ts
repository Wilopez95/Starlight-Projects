import { IEntity } from './Entity';

export interface IThirdPartyHauler extends IEntity {
  active: boolean;
  description: string;
  id: number;
  originalId: number;
}
