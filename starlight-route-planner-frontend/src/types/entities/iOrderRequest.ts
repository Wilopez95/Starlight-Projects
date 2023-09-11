import { IEntity } from './entity';

export interface IOrderRequest extends IEntity {
  counts?: number;
}
