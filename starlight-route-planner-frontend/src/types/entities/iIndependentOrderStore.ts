import { IndependentOrderService } from '@root/api';
import { IStoreCount } from '../counts';
import { IEntity } from './entity';

export interface IIndependentOrderStore extends IEntity {
  allCounts?: IStoreCount;
  service: IndependentOrderService;
}
